// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "./interfaces/IIdentityRegistry.sol";

/**
 * @title EscrowPayment
 * @dev Manages security deposits, rent payments, and escrow functionality
 * Integrates with Integra's fiat payment rails and on-chain proof-of-payment
 */
contract EscrowPayment is AccessControl, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;
    
    // Roles
    bytes32 public constant ESCROW_AGENT_ROLE = keccak256("ESCROW_AGENT_ROLE");
    bytes32 public constant PAYMENT_PROCESSOR_ROLE = keccak256("PAYMENT_PROCESSOR_ROLE");
    bytes32 public constant DISPUTE_RESOLVER_ROLE = keccak256("DISPUTE_RESOLVER_ROLE");
    
    // Escrow status enumeration
    enum EscrowStatus {
        CREATED,        // Escrow created, awaiting deposit
        FUNDED,         // Funds deposited in escrow
        RELEASED,       // Funds released to recipient
        REFUNDED,       // Funds refunded to depositor
        DISPUTED,       // Escrow under dispute
        EXPIRED         // Escrow expired
    }
    
    // Payment method enumeration
    enum PaymentMethod {
        CRYPTO,         // Direct crypto payment
        FIAT_BRIDGE,    // Fiat payment via Integra bridge
        HYBRID          // Combination of crypto and fiat
    }
    
    // Escrow structure for security deposits
    struct SecurityDepositEscrow {
        uint256 escrowId;
        uint256 leaseId;            // Associated lease agreement
        address landlord;           // Funds recipient
        address tenant;             // Funds depositor
        address paymentToken;       // ERC-20 token (USDC, IRL, etc.)
        uint256 amount;             // Deposit amount
        uint256 createdAt;          // Creation timestamp
        uint256 releaseDate;        // Earliest release date
        EscrowStatus status;        // Current status
        string releaseConditions;   // IPFS hash of release conditions
        bytes32 conditionsHash;     // Hash of conditions for verification
    }
    
    // Rent payment structure
    struct RentPayment {
        uint256 paymentId;
        uint256 leaseId;            // Associated lease
        address landlord;           // Payment recipient
        address tenant;             // Payment sender
        address paymentToken;       // Payment token
        uint256 amount;             // Payment amount
        uint256 dueDate;            // Payment due date
        uint256 paidDate;           // Actual payment date
        PaymentMethod method;       // Payment method used
        string fiatReference;       // Fiat payment reference (if applicable)
        bytes32 proofHash;          // Hash of payment proof
        bool isAutomated;           // Whether payment was automated
    }
    
    // Automated payment subscription
    struct PaymentSubscription {
        uint256 subscriptionId;
        uint256 leaseId;
        address tenant;
        address landlord;
        address paymentToken;
        uint256 amount;             // Monthly payment amount
        uint256 startDate;          // Subscription start
        uint256 endDate;            // Subscription end
        uint256 lastPayment;        // Last successful payment
        uint256 nextPayment;        // Next scheduled payment
        bool isActive;              // Subscription status
        uint256 failedPayments;     // Failed payment counter
    }
    
    // Storage mappings
    mapping(uint256 => SecurityDepositEscrow) public securityDeposits;
    mapping(uint256 => RentPayment) public rentPayments;
    mapping(uint256 => PaymentSubscription) public paymentSubscriptions;
    mapping(uint256 => uint256) public leaseToEscrow;           // leaseId => escrowId
    mapping(uint256 => uint256) public leaseToSubscription;     // leaseId => subscriptionId
    mapping(address => bool) public approvedTokens;
    mapping(address => uint256[]) public landlordEscrows;
    mapping(address => uint256[]) public tenantEscrows;
    
    // Counters
    uint256 private _escrowCounter;
    uint256 private _paymentCounter;
    uint256 private _subscriptionCounter;
    
    // Contract references
    IIdentityRegistry public identityRegistry;
    address public leaseAgreementContract;
    address public fiatBridge;                  // Integra fiat bridge contract
    
    // Configuration
    uint256 public defaultEscrowPeriod = 365 days;
    uint256 public maxEscrowPeriod = 5 * 365 days;
    uint256 public automatedPaymentGracePeriod = 3 days;
    uint256 public maxFailedPayments = 3;
    
    // Events
    event SecurityDepositCreated(
        uint256 indexed escrowId,
        uint256 indexed leaseId,
        address indexed tenant,
        address landlord,
        uint256 amount
    );
    
    event SecurityDepositFunded(
        uint256 indexed escrowId,
        address indexed tenant,
        uint256 amount
    );
    
    event SecurityDepositReleased(
        uint256 indexed escrowId,
        address indexed recipient,
        uint256 amount,
        string reason
    );
    
    event RentPaymentProcessed(
        uint256 indexed paymentId,
        uint256 indexed leaseId,
        address indexed tenant,
        address landlord,
        uint256 amount,
        PaymentMethod method
    );
    
    event PaymentSubscriptionCreated(
        uint256 indexed subscriptionId,
        uint256 indexed leaseId,
        address indexed tenant,
        uint256 amount
    );
    
    event AutomatedPaymentExecuted(
        uint256 indexed subscriptionId,
        uint256 indexed paymentId,
        uint256 amount
    );
    
    event AutomatedPaymentFailed(
        uint256 indexed subscriptionId,
        uint256 failureCount,
        string reason
    );
    
    event DisputeRaised(
        uint256 indexed escrowId,
        address indexed raisedBy,
        string reason
    );
    
    constructor(
        address _identityRegistry,
        address _leaseAgreementContract
    ) {
        require(_identityRegistry != address(0), "EscrowPayment: invalid identity registry");
        require(_leaseAgreementContract != address(0), "EscrowPayment: invalid lease contract");
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ESCROW_AGENT_ROLE, msg.sender);
        _grantRole(PAYMENT_PROCESSOR_ROLE, msg.sender);
        _grantRole(DISPUTE_RESOLVER_ROLE, msg.sender);
        
        identityRegistry = IIdentityRegistry(_identityRegistry);
        leaseAgreementContract = _leaseAgreementContract;
    }
    
    // Modifiers
    modifier onlyEscrowAgent() {
        require(hasRole(ESCROW_AGENT_ROLE, msg.sender), "EscrowPayment: not an escrow agent");
        _;
    }
    
    modifier onlyPaymentProcessor() {
        require(hasRole(PAYMENT_PROCESSOR_ROLE, msg.sender), "EscrowPayment: not payment processor");
        _;
    }
    
    modifier onlyDisputeResolver() {
        require(hasRole(DISPUTE_RESOLVER_ROLE, msg.sender), "EscrowPayment: not dispute resolver");
        _;
    }
    
    modifier validEscrow(uint256 _escrowId) {
        require(_escrowId > 0 && _escrowId <= _escrowCounter, "EscrowPayment: invalid escrow ID");
        require(securityDeposits[_escrowId].landlord != address(0), "EscrowPayment: escrow not found");
        _;
    }
    
    modifier onlyEscrowParties(uint256 _escrowId) {
        require(
            msg.sender == securityDeposits[_escrowId].landlord || 
            msg.sender == securityDeposits[_escrowId].tenant,
            "EscrowPayment: not an escrow party"
        );
        _;
    }
    
    modifier verifiedUsers(address _landlord, address _tenant) {
        require(identityRegistry.isVerified(_landlord), "EscrowPayment: landlord not verified");
        require(identityRegistry.isVerified(_tenant), "EscrowPayment: tenant not verified");
        _;
    }
    
    // Security Deposit Functions
    
    /**
     * @dev Create security deposit escrow for a lease
     */
    function createSecurityDepositEscrow(
        uint256 _leaseId,
        address _landlord,
        address _tenant,
        address _paymentToken,
        uint256 _amount,
        uint256 _releaseDate,
        string calldata _releaseConditions,
        bytes32 _conditionsHash
    ) external 
        whenNotPaused 
        verifiedUsers(_landlord, _tenant) 
        returns (uint256) 
    {
        require(_leaseId > 0, "EscrowPayment: invalid lease ID");
        require(_amount > 0, "EscrowPayment: invalid amount");
        require(approvedTokens[_paymentToken], "EscrowPayment: token not approved");
        require(_releaseDate > block.timestamp, "EscrowPayment: invalid release date");
        require(_releaseDate <= block.timestamp + maxEscrowPeriod, "EscrowPayment: release date too far");
        require(leaseToEscrow[_leaseId] == 0, "EscrowPayment: escrow already exists for lease");
        
        _escrowCounter++;
        uint256 escrowId = _escrowCounter;
        
        securityDeposits[escrowId] = SecurityDepositEscrow({
            escrowId: escrowId,
            leaseId: _leaseId,
            landlord: _landlord,
            tenant: _tenant,
            paymentToken: _paymentToken,
            amount: _amount,
            createdAt: block.timestamp,
            releaseDate: _releaseDate,
            status: EscrowStatus.CREATED,
            releaseConditions: _releaseConditions,
            conditionsHash: _conditionsHash
        });
        
        leaseToEscrow[_leaseId] = escrowId;
        landlordEscrows[_landlord].push(escrowId);
        tenantEscrows[_tenant].push(escrowId);
        
        emit SecurityDepositCreated(escrowId, _leaseId, _tenant, _landlord, _amount);
        
        return escrowId;
    }
    
    /**
     * @dev Fund security deposit escrow
     */
    function fundSecurityDeposit(uint256 _escrowId) 
        external 
        validEscrow(_escrowId) 
        nonReentrant 
    {
        SecurityDepositEscrow storage escrow = securityDeposits[_escrowId];
        require(msg.sender == escrow.tenant, "EscrowPayment: only tenant can fund");
        require(escrow.status == EscrowStatus.CREATED, "EscrowPayment: escrow not in created status");
        
        IERC20 token = IERC20(escrow.paymentToken);
        require(token.balanceOf(msg.sender) >= escrow.amount, "EscrowPayment: insufficient balance");
        
        token.safeTransferFrom(msg.sender, address(this), escrow.amount);
        
        escrow.status = EscrowStatus.FUNDED;
        
        emit SecurityDepositFunded(_escrowId, msg.sender, escrow.amount);
    }
    
    /**
     * @dev Release security deposit
     */
    function releaseSecurityDeposit(
        uint256 _escrowId, 
        address _recipient,
        uint256 _amount,
        string calldata _reason
    ) external validEscrow(_escrowId) onlyEscrowAgent nonReentrant {
        SecurityDepositEscrow storage escrow = securityDeposits[_escrowId];
        require(escrow.status == EscrowStatus.FUNDED, "EscrowPayment: escrow not funded");
        require(block.timestamp >= escrow.releaseDate, "EscrowPayment: release date not reached");
        require(_amount <= escrow.amount, "EscrowPayment: amount exceeds deposit");
        require(
            _recipient == escrow.landlord || _recipient == escrow.tenant,
            "EscrowPayment: invalid recipient"
        );
        
        IERC20 token = IERC20(escrow.paymentToken);
        token.safeTransfer(_recipient, _amount);
        
        if (_amount == escrow.amount) {
            escrow.status = EscrowStatus.RELEASED;
        } else {
            // Partial release - reduce escrow amount
            escrow.amount -= _amount;
        }
        
        emit SecurityDepositReleased(_escrowId, _recipient, _amount, _reason);
    }
    
    /**
     * @dev Refund security deposit to tenant
     */
    function refundSecurityDeposit(uint256 _escrowId, string calldata _reason) 
        external 
        validEscrow(_escrowId) 
        onlyEscrowAgent 
        nonReentrant 
    {
        SecurityDepositEscrow storage escrow = securityDeposits[_escrowId];
        require(escrow.status == EscrowStatus.FUNDED, "EscrowPayment: escrow not funded");
        
        IERC20 token = IERC20(escrow.paymentToken);
        token.safeTransfer(escrow.tenant, escrow.amount);
        
        escrow.status = EscrowStatus.REFUNDED;
        
        emit SecurityDepositReleased(_escrowId, escrow.tenant, escrow.amount, _reason);
    }
    
    // Rent Payment Functions
    
    /**
     * @dev Process rent payment
     */
    function processRentPayment(
        uint256 _leaseId,
        address _landlord,
        address _tenant,
        address _paymentToken,
        uint256 _amount,
        uint256 _dueDate,
        PaymentMethod _method,
        string calldata _fiatReference,
        bytes32 _proofHash
    ) external 
        whenNotPaused 
        onlyPaymentProcessor 
        nonReentrant 
        returns (uint256) 
    {
        require(_amount > 0, "EscrowPayment: invalid amount");
        require(approvedTokens[_paymentToken], "EscrowPayment: token not approved");
        require(identityRegistry.isVerified(_landlord), "EscrowPayment: landlord not verified");
        require(identityRegistry.isVerified(_tenant), "EscrowPayment: tenant not verified");
        
        _paymentCounter++;
        uint256 paymentId = _paymentCounter;
        
        if (_method == PaymentMethod.CRYPTO) {
            IERC20 token = IERC20(_paymentToken);
            token.safeTransferFrom(_tenant, _landlord, _amount);
        }
        // For FIAT_BRIDGE and HYBRID, funds are handled by external bridge
        
        rentPayments[paymentId] = RentPayment({
            paymentId: paymentId,
            leaseId: _leaseId,
            landlord: _landlord,
            tenant: _tenant,
            paymentToken: _paymentToken,
            amount: _amount,
            dueDate: _dueDate,
            paidDate: block.timestamp,
            method: _method,
            fiatReference: _fiatReference,
            proofHash: _proofHash,
            isAutomated: false
        });
        
        emit RentPaymentProcessed(paymentId, _leaseId, _tenant, _landlord, _amount, _method);
        
        return paymentId;
    }
    
    // Automated Payment Functions
    
    /**
     * @dev Create automated payment subscription for rent
     */
    function createPaymentSubscription(
        uint256 _leaseId,
        address _tenant,
        address _landlord,
        address _paymentToken,
        uint256 _monthlyAmount,
        uint256 _startDate,
        uint256 _endDate
    ) external 
        whenNotPaused 
        verifiedUsers(_landlord, _tenant) 
        returns (uint256) 
    {
        require(_leaseId > 0, "EscrowPayment: invalid lease ID");
        require(_monthlyAmount > 0, "EscrowPayment: invalid amount");
        require(approvedTokens[_paymentToken], "EscrowPayment: token not approved");
        require(_startDate >= block.timestamp, "EscrowPayment: start date in past");
        require(_endDate > _startDate, "EscrowPayment: invalid subscription period");
        require(leaseToSubscription[_leaseId] == 0, "EscrowPayment: subscription already exists");
        
        _subscriptionCounter++;
        uint256 subscriptionId = _subscriptionCounter;
        
        paymentSubscriptions[subscriptionId] = PaymentSubscription({
            subscriptionId: subscriptionId,
            leaseId: _leaseId,
            tenant: _tenant,
            landlord: _landlord,
            paymentToken: _paymentToken,
            amount: _monthlyAmount,
            startDate: _startDate,
            endDate: _endDate,
            lastPayment: 0,
            nextPayment: _startDate,
            isActive: true,
            failedPayments: 0
        });
        
        leaseToSubscription[_leaseId] = subscriptionId;
        
        emit PaymentSubscriptionCreated(subscriptionId, _leaseId, _tenant, _monthlyAmount);
        
        return subscriptionId;
    }
    
    /**
     * @dev Execute automated payment
     */
    function executeAutomatedPayment(uint256 _subscriptionId) 
        public 
        onlyPaymentProcessor 
        nonReentrant 
        returns (uint256) 
    {
        PaymentSubscription storage subscription = paymentSubscriptions[_subscriptionId];
        require(subscription.isActive, "EscrowPayment: subscription not active");
        require(block.timestamp >= subscription.nextPayment, "EscrowPayment: payment not due");
        require(block.timestamp <= subscription.endDate, "EscrowPayment: subscription expired");
        
        IERC20 token = IERC20(subscription.paymentToken);
        
        try token.transferFrom(subscription.tenant, subscription.landlord, subscription.amount) {
            _paymentCounter++;
            uint256 paymentId = _paymentCounter;
            
            rentPayments[paymentId] = RentPayment({
                paymentId: paymentId,
                leaseId: subscription.leaseId,
                landlord: subscription.landlord,
                tenant: subscription.tenant,
                paymentToken: subscription.paymentToken,
                amount: subscription.amount,
                dueDate: subscription.nextPayment,
                paidDate: block.timestamp,
                method: PaymentMethod.CRYPTO,
                fiatReference: "",
                proofHash: bytes32(0),
                isAutomated: true
            });
            
            subscription.lastPayment = block.timestamp;
            subscription.nextPayment += 30 days; // Move to next month
            subscription.failedPayments = 0; // Reset failure counter
            
            emit AutomatedPaymentExecuted(_subscriptionId, paymentId, subscription.amount);
            emit RentPaymentProcessed(
                paymentId, 
                subscription.leaseId, 
                subscription.tenant, 
                subscription.landlord, 
                subscription.amount, 
                PaymentMethod.CRYPTO
            );
            
            return paymentId;
        } catch {
            subscription.failedPayments++;
            
            if (subscription.failedPayments >= maxFailedPayments) {
                subscription.isActive = false;
            }
            
            emit AutomatedPaymentFailed(_subscriptionId, subscription.failedPayments, "Transfer failed");
            
            return 0;
        }
    }
    
    /**
     * @dev Cancel payment subscription
     */
    function cancelPaymentSubscription(uint256 _subscriptionId) 
        external 
    {
        PaymentSubscription storage subscription = paymentSubscriptions[_subscriptionId];
        require(
            msg.sender == subscription.tenant || 
            msg.sender == subscription.landlord ||
            hasRole(DEFAULT_ADMIN_ROLE, msg.sender),
            "EscrowPayment: not authorized to cancel"
        );
        
        subscription.isActive = false;
    }
    
    // Dispute Functions
    
    /**
     * @dev Raise dispute on escrow
     */
    function raiseEscrowDispute(uint256 _escrowId, string calldata _reason) 
        external 
        validEscrow(_escrowId) 
        onlyEscrowParties(_escrowId) 
    {
        SecurityDepositEscrow storage escrow = securityDeposits[_escrowId];
        require(escrow.status == EscrowStatus.FUNDED, "EscrowPayment: escrow not funded");
        
        escrow.status = EscrowStatus.DISPUTED;
        
        emit DisputeRaised(_escrowId, msg.sender, _reason);
    }
    
    /**
     * @dev Resolve escrow dispute
     */
    function resolveEscrowDispute(
        uint256 _escrowId, 
        address _recipient,
        uint256 _amount,
        string calldata _resolution
    ) external validEscrow(_escrowId) onlyDisputeResolver nonReentrant {
        SecurityDepositEscrow storage escrow = securityDeposits[_escrowId];
        require(escrow.status == EscrowStatus.DISPUTED, "EscrowPayment: not disputed");
        require(_amount <= escrow.amount, "EscrowPayment: amount exceeds deposit");
        require(
            _recipient == escrow.landlord || _recipient == escrow.tenant,
            "EscrowPayment: invalid recipient"
        );
        
        IERC20 token = IERC20(escrow.paymentToken);
        token.safeTransfer(_recipient, _amount);
        
        if (_amount == escrow.amount) {
            escrow.status = EscrowStatus.RELEASED;
        } else {
            escrow.amount -= _amount;
            escrow.status = EscrowStatus.FUNDED; // Return to funded status for remainder
        }
        
        emit SecurityDepositReleased(_escrowId, _recipient, _amount, _resolution);
    }
    
    // View Functions
    
    /**
     * @dev Get security deposit details
     */
    function getSecurityDeposit(uint256 _escrowId) 
        external 
        view 
        validEscrow(_escrowId) 
        returns (SecurityDepositEscrow memory) 
    {
        return securityDeposits[_escrowId];
    }
    
    /**
     * @dev Get rent payment details
     */
    function getRentPayment(uint256 _paymentId) 
        external 
        view 
        returns (RentPayment memory) 
    {
        require(_paymentId > 0 && _paymentId <= _paymentCounter, "EscrowPayment: invalid payment ID");
        return rentPayments[_paymentId];
    }
    
    /**
     * @dev Get payment subscription details
     */
    function getPaymentSubscription(uint256 _subscriptionId) 
        external 
        view 
        returns (PaymentSubscription memory) 
    {
        require(_subscriptionId > 0 && _subscriptionId <= _subscriptionCounter, 
                "EscrowPayment: invalid subscription ID");
        return paymentSubscriptions[_subscriptionId];
    }
    
    /**
     * @dev Get landlord's escrows
     */
    function getLandlordEscrows(address _landlord) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return landlordEscrows[_landlord];
    }
    
    /**
     * @dev Get tenant's escrows
     */
    function getTenantEscrows(address _tenant) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return tenantEscrows[_tenant];
    }
    
    /**
     * @dev Get escrow ID for lease
     */
    function getLeaseEscrow(uint256 _leaseId) 
        external 
        view 
        returns (uint256) 
    {
        return leaseToEscrow[_leaseId];
    }
    
    /**
     * @dev Get subscription ID for lease
     */
    function getLeaseSubscription(uint256 _leaseId) 
        external 
        view 
        returns (uint256) 
    {
        return leaseToSubscription[_leaseId];
    }
    
    // Administrative Functions
    
    /**
     * @dev Set approved payment token
     */
    function setApprovedToken(address _token, bool _approved) 
        external 
        onlyRole(DEFAULT_ADMIN_ROLE) 
    {
        approvedTokens[_token] = _approved;
    }
    
    /**
     * @dev Set fiat bridge contract
     */
    function setFiatBridge(address _fiatBridge) 
        external 
        onlyRole(DEFAULT_ADMIN_ROLE) 
    {
        fiatBridge = _fiatBridge;
    }
    
    /**
     * @dev Update configuration parameters
     */
    function updateConfiguration(
        uint256 _defaultEscrowPeriod,
        uint256 _maxEscrowPeriod,
        uint256 _gracePeriod,
        uint256 _maxFailedPayments
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        defaultEscrowPeriod = _defaultEscrowPeriod;
        maxEscrowPeriod = _maxEscrowPeriod;
        automatedPaymentGracePeriod = _gracePeriod;
        maxFailedPayments = _maxFailedPayments;
    }
    
    /**
     * @dev Emergency pause
     */
    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }
    
    /**
     * @dev Unpause
     */
    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }
    
    /**
     * @dev Batch execute automated payments
     */
    function batchExecuteAutomatedPayments(uint256[] calldata _subscriptionIds) 
        external 
        onlyPaymentProcessor 
    {
        for (uint256 i = 0; i < _subscriptionIds.length; i++) {
            if (_subscriptionIds[i] > 0 && _subscriptionIds[i] <= _subscriptionCounter) {
                PaymentSubscription memory subscription = paymentSubscriptions[_subscriptionIds[i]];
                if (subscription.isActive && 
                    block.timestamp >= subscription.nextPayment &&
                    block.timestamp <= subscription.endDate) {
                    executeAutomatedPayment(_subscriptionIds[i]);
                }
            }
        }
    }
}
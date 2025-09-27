// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./LeaseAgreement.sol";

/**
 * @title EscrowPayment
 * @dev Handles escrow payments and automated rent collection
 */
contract EscrowPayment is AccessControl, ReentrancyGuard {
    using SafeERC20 for IERC20;
    
    bytes32 public constant ESCROW_AGENT_ROLE = keccak256("ESCROW_AGENT_ROLE");
    bytes32 public constant PAYMENT_PROCESSOR_ROLE = keccak256("PAYMENT_PROCESSOR_ROLE");
    
    enum EscrowStatus { PENDING, FUNDED, RELEASED, REFUNDED, DISPUTED }
    
    struct EscrowDeposit {
        uint256 escrowId;
        uint256 leaseId;
        address depositor;
        address beneficiary;
        address token;
        uint256 amount;
        EscrowStatus status;
        uint256 createdAt;
        uint256 releaseDate;
        string purpose;
    }
    
    struct RentPayment {
        uint256 leaseId;
        uint256 amount;
        address token;
        uint256 dueDate;
        uint256 paidDate;
        bool isPaid;
        address payer;
    }
    
    LeaseAgreement public immutable leaseAgreement;
    
    uint256 private _escrowCounter;
    uint256 private _paymentCounter;
    
    mapping(uint256 => EscrowDeposit) private _escrows;
    mapping(uint256 => RentPayment) private _rentPayments;
    mapping(uint256 => uint256[]) private _leasePayments; // leaseId => paymentIds
    
    // Events
    event EscrowCreated(
        uint256 indexed escrowId,
        uint256 indexed leaseId,
        address indexed depositor,
        uint256 amount
    );
    
    event EscrowFunded(uint256 indexed escrowId, uint256 amount);
    event EscrowReleased(uint256 indexed escrowId, address indexed to, uint256 amount);
    event EscrowRefunded(uint256 indexed escrowId, address indexed to, uint256 amount);
    
    event RentPaymentCreated(
        uint256 indexed paymentId,
        uint256 indexed leaseId,
        uint256 amount,
        uint256 dueDate
    );
    
    event RentPaid(
        uint256 indexed paymentId,
        uint256 indexed leaseId,
        address indexed payer,
        uint256 amount
    );
    
    constructor(address _leaseAgreement) {
        require(_leaseAgreement != address(0), "Invalid lease agreement");
        leaseAgreement = LeaseAgreement(_leaseAgreement);
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ESCROW_AGENT_ROLE, msg.sender);
        _grantRole(PAYMENT_PROCESSOR_ROLE, msg.sender);
    }
    
    // Escrow functions
    function createEscrow(
        uint256 leaseId,
        address beneficiary,
        address token,
        uint256 amount,
        uint256 releaseDate,
        string memory purpose
    ) external returns (uint256) {
        require(beneficiary != address(0), "Invalid beneficiary");
        require(token != address(0), "Invalid token");
        require(amount > 0, "Amount must be greater than 0");
        require(releaseDate > block.timestamp, "Release date must be in the future");
        
        // Verify lease exists
        LeaseAgreement.Lease memory lease = leaseAgreement.getLease(leaseId);
        require(lease.leaseId != 0, "Lease does not exist");
        
        _escrowCounter++;
        uint256 escrowId = _escrowCounter;
        
        _escrows[escrowId] = EscrowDeposit({
            escrowId: escrowId,
            leaseId: leaseId,
            depositor: msg.sender,
            beneficiary: beneficiary,
            token: token,
            amount: amount,
            status: EscrowStatus.PENDING,
            createdAt: block.timestamp,
            releaseDate: releaseDate,
            purpose: purpose
        });
        
        emit EscrowCreated(escrowId, leaseId, msg.sender, amount);
        return escrowId;
    }
    
    function fundEscrow(uint256 escrowId) external nonReentrant {
        EscrowDeposit storage escrow = _escrows[escrowId];
        require(escrow.escrowId != 0, "Escrow does not exist");
        require(escrow.status == EscrowStatus.PENDING, "Escrow already funded");
        require(msg.sender == escrow.depositor, "Only depositor can fund");
        
        IERC20(escrow.token).safeTransferFrom(msg.sender, address(this), escrow.amount);
        escrow.status = EscrowStatus.FUNDED;
        
        emit EscrowFunded(escrowId, escrow.amount);
    }
    
    function releaseEscrow(uint256 escrowId) external onlyRole(ESCROW_AGENT_ROLE) nonReentrant {
        EscrowDeposit storage escrow = _escrows[escrowId];
        require(escrow.escrowId != 0, "Escrow does not exist");
        require(escrow.status == EscrowStatus.FUNDED, "Escrow not funded");
        require(block.timestamp >= escrow.releaseDate, "Release date not reached");
        
        escrow.status = EscrowStatus.RELEASED;
        IERC20(escrow.token).safeTransfer(escrow.beneficiary, escrow.amount);
        
        emit EscrowReleased(escrowId, escrow.beneficiary, escrow.amount);
    }
    
    function refundEscrow(uint256 escrowId) external onlyRole(ESCROW_AGENT_ROLE) nonReentrant {
        EscrowDeposit storage escrow = _escrows[escrowId];
        require(escrow.escrowId != 0, "Escrow does not exist");
        require(escrow.status == EscrowStatus.FUNDED, "Escrow not funded");
        
        escrow.status = EscrowStatus.REFUNDED;
        IERC20(escrow.token).safeTransfer(escrow.depositor, escrow.amount);
        
        emit EscrowRefunded(escrowId, escrow.depositor, escrow.amount);
    }
    
    // Rent payment functions
    function createRentPayment(
        uint256 leaseId,
        uint256 amount,
        address token,
        uint256 dueDate
    ) external onlyRole(PAYMENT_PROCESSOR_ROLE) returns (uint256) {
        require(amount > 0, "Amount must be greater than 0");
        require(token != address(0), "Invalid token");
        require(dueDate > block.timestamp, "Due date must be in the future");
        
        // Verify lease exists and is active
        require(leaseAgreement.isLeaseActive(leaseId), "Lease is not active");
        
        _paymentCounter++;
        uint256 paymentId = _paymentCounter;
        
        _rentPayments[paymentId] = RentPayment({
            leaseId: leaseId,
            amount: amount,
            token: token,
            dueDate: dueDate,
            paidDate: 0,
            isPaid: false,
            payer: address(0)
        });
        
        _leasePayments[leaseId].push(paymentId);
        
        emit RentPaymentCreated(paymentId, leaseId, amount, dueDate);
        return paymentId;
    }
    
    function payRent(uint256 paymentId) external nonReentrant {
        RentPayment storage payment = _rentPayments[paymentId];
        require(payment.leaseId != 0, "Payment does not exist");
        require(!payment.isPaid, "Payment already made");
        require(block.timestamp <= payment.dueDate + 7 days, "Payment deadline passed");
        
        // Get lease details
        LeaseAgreement.Lease memory lease = leaseAgreement.getLease(payment.leaseId);
        require(msg.sender == lease.tenant, "Only tenant can pay rent");
        
        IERC20(payment.token).safeTransferFrom(msg.sender, lease.landlord, payment.amount);
        
        payment.isPaid = true;
        payment.paidDate = block.timestamp;
        payment.payer = msg.sender;
        
        emit RentPaid(paymentId, payment.leaseId, msg.sender, payment.amount);
    }
    
    // View functions
    function getEscrow(uint256 escrowId) external view returns (EscrowDeposit memory) {
        require(_escrows[escrowId].escrowId != 0, "Escrow does not exist");
        return _escrows[escrowId];
    }
    
    function getRentPayment(uint256 paymentId) external view returns (RentPayment memory) {
        require(_rentPayments[paymentId].leaseId != 0, "Payment does not exist");
        return _rentPayments[paymentId];
    }
    
    function getLeasePayments(uint256 leaseId) external view returns (uint256[] memory) {
        return _leasePayments[leaseId];
    }
    
    function getTotalEscrows() external view returns (uint256) {
        return _escrowCounter;
    }
    
    function getTotalPayments() external view returns (uint256) {
        return _paymentCounter;
    }
    
    function isPaymentDue(uint256 paymentId) external view returns (bool) {
        RentPayment memory payment = _rentPayments[paymentId];
        return !payment.isPaid && block.timestamp >= payment.dueDate;
    }
    
    function getOverduePayments(uint256 leaseId) external view returns (uint256[] memory) {
        uint256[] memory leasePaymentIds = _leasePayments[leaseId];
        uint256 overdueCount = 0;
        
        // Count overdue payments
        for (uint256 i = 0; i < leasePaymentIds.length; i++) {
            RentPayment memory payment = _rentPayments[leasePaymentIds[i]];
            if (!payment.isPaid && block.timestamp > payment.dueDate) {
                overdueCount++;
            }
        }
        
        // Build overdue payments array
        uint256[] memory overduePayments = new uint256[](overdueCount);
        uint256 index = 0;
        
        for (uint256 i = 0; i < leasePaymentIds.length; i++) {
            RentPayment memory payment = _rentPayments[leasePaymentIds[i]];
            if (!payment.isPaid && block.timestamp > payment.dueDate) {
                overduePayments[index] = leasePaymentIds[i];
                index++;
            }
        }
        
        return overduePayments;
    }
    
    // Emergency functions
    function emergencyWithdraw(
        address token,
        uint256 amount,
        address to
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(to != address(0), "Invalid recipient");
        IERC20(token).safeTransfer(to, amount);
    }
}
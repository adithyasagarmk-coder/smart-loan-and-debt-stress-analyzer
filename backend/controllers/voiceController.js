const User = require('../models/User');
const Loan = require('../models/Loan');

exports.handleIntent = async (req, res) => {
  try {
    const { intent, userId } = req.body;

    if (!intent || !userId) {
      return res.status(400).json({
        success: false,
        message: 'Missing intent or userId',
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    let speechText = "I'm not sure how to help with that.";

    switch (intent) {
      case 'GetLoanSummary': {
        const loans = await Loan.find({ user: userId });
        if (loans.length === 0) {
          speechText = `Hello ${user.name}, you currently have no active loans recorded.`;
        } else {
          const totalBalance = loans.reduce((sum, loan) => sum + loan.outstandingBalance, 0);
          speechText = `Hello ${user.name}, you currently have ${loans.length} active loans with a total outstanding balance of $${totalBalance.toLocaleString()}.`;
        }
        break;
      }
      
      case 'GetDebtScore': {
        speechText = `Your current debt health score is ${user.debtHealthScore} out of 100.`;
        if (user.debtHealthScore > 75) {
          speechText += " You are in excellent financial health!";
        } else if (user.debtHealthScore < 40) {
          speechText += " Your debt health is poor. Please review your expenses.";
        }
        break;
      }

      default:
        speechText = "Sorry, I don't recognize that command.";
    }

    res.status(200).json({
      success: true,
      data: {
        speech: speechText,
      },
    });
  } catch (error) {
    console.error('Voice Assistant Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process voice intent',
    });
  }
};

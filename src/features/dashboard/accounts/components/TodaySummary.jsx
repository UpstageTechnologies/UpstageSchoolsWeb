export default function TodaySummary({
    todayIncome,
    todayExpense,
    todayProfit
  }) {
    return (
        <div className="today-summary">
        <div className="today-card blue">
          <span>Today Income</span>
          <h2>₹{todayIncome.toLocaleString("en-IN")}</h2>
        </div>
  
        <div className="today-card yellow">
          <span>Today Expense</span>
          <h2>₹{todayExpense.toLocaleString("en-IN")}</h2>
        </div>
  
        <div className="today-card green">
          <span>Today Profit</span>
          <h2>₹{todayProfit.toLocaleString("en-IN")}</h2>
        </div>
      </div>
    );
  }
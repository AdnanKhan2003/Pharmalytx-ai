# Pharmalytix AI - Simple Project Breakdown

## 1. Problem Statement
**The Hook**: Every day, pharmacists waste hours counting strips of medicine by hand, often realizing too late that expensive drugs have expired.

**The Gap**: Most software is too expensive and hard to use for small shops, while paper notebooks are messy and provide no alerts.

**The Consequence**: Pharmacies lose money on expired stock, make calculation errors during billing, and have no idea how much they are actually earning.

## 2. Objective
**One-Liner Mission**: To replace paper notebooks with a smart, easy-to-use digital system that handles stock and sales automatically.

**Target Audience**: Small medical store owners who are not very tech-savvy.

**Key Outcome**: Save 70% of daily work time and stop losing money on expired medicines.

## 3. Features
**Core Modules**:
1.  **Inventory Tracking**: See exactly how much stock you have and when it expires.
2.  **Fast Billing (POS)**: Create bills in seconds; stock is removed automatically.
3.  **Smart Forecast**: The system tells you what to buy so you don't run out.

**USP (Unique Selling Point)**: **Actionable Alerts**: It doesn't just list medicines; it shouts (alerts) when something is about to expire or go out of stock.

**User Benefit**:
-   **Save Time**: No more manual counting.
-   **Save Money**: Sell medicines before they expire.
-   **Peace of Mind**: Know exactly where your business stands.

## 4. How You Implemented It
**Development**: I built it piece by piece. First, I made sure we could add medicines (Inventory), then sell them (Sales), and finally, see the reports (Analytics).

**Design First**: I planned the database first—deciding how "Products" and "Sales" relate—so the data would always be accurate.

**Workflow**:
1.  **Add Stock**: Pharmacist enters medicine details.
2.  **Sell**: Cashier scans/selects items to bill.
3.  **Update**: System instantly subtracts the sold items from inventory.
4.  **Report**: Owner sees the profit immediately on the dashboard.

## 5. Frontend Tech (The Visuals)
**Tech Stack**: **Next.js** (Framework), **React** (UI), **Tailwind CSS** (Styling).

**State Management**: I kept it simple. Most data comes fresh from the server, so I didn't need complex tools like Redux.

**Design**: I used a "Dark Mode" look because pharmacists often look at screens all day, and it reduces eye strain.

**Optimization**: The dashboard loads fast because calculations happen on the server, not the user's slow laptop.

## 6. Backend Tech (The Brain)
**Server Logic**: **Next.js Server Actions**. This lets the frontend talk directly to the database without complex setup.

**Database**: **PostgreSQL** with **Prisma**.
-   *Why?* It's structured and safe. In a pharmacy, you can't have "half" a sale recorded. It has to be accurate.

**Security**:
-   **Login**: Secure login system (NextAuth).
-   **Roles**: Owners see everything; cashiers only see the billing screen.

## 7. Conclusion
**Summary**: I turned a messy manual process into a clean, automated digital workflow.

**Future Scope**:
1.  **Barcode Scanning**: Beep to sell.
2.  **SMS Alerts**: Get a text when stock is low.

**Final Impact**: A small shop owner can now run their business like a big retail chain.

---

## 8. Interview Questions (Simplified)

### Simple Questions

**Q1: What technologies did you use?**
*Answer:*
I used the **Next.js** full-stack framework.
-   **Frontend**: React & Tailwind CSS for designs.
-   **Database**: PostgreSQL to store data.
-   **Tool**: Prisma to talk to the database easily.

**Q2: How does the "Smart Forecast" work?**
*Answer:*
It's simple math. It looks at how many strips you sold in the last 30 days and assumes you'll sell the same amount next month.
*Code Idea:*
```javascript
dailySales = totalSales / 30;
nextMonthNeed = dailySales * 30;
```

### Medium Questions

**Q3: How do you separate Owners from Cashiers?**
*Answer:*
I use **Roles**. When a user logs in, the system checks if they are an `ADMIN` or `CASHIER`.
-   **Admins** can see total profits.
-   **Cashiers** can only make bills.
*Code Idea:*
```javascript
if (user.role !== 'ADMIN') {
  showError("You are not allowed here!");
}
```

**Q4: Why use "Server Actions" instead of a normal API?**
*Answer:*
It's simpler. Instead of writing a separate "backend server" and connecting it, Next.js lets me write a function specifically for the frontend to use. It cuts the work in half.

### Hard Questions

**Q5: What happens if two people buy the last item at the exact same time?**
*Answer:*
This is a common "race condition". To fix it, the database needs to "lock" that item for a split second while the first sale processes.
*Code Idea:*
```javascript
// Use a transaction
database.transaction(() => {
  if (stock > 0) {
    stock = stock - 1; // Safe!
  } else {
    fail("Out of stock!");
  }
});
```

**Q6: Why did you group sales by "Batch" in your code?**
*Answer:*
Because the same medicine can have different expiry dates (batches). When checking sales, I need to know *exactly* which batch was sold to track expiry correctly, not just the medicine name.

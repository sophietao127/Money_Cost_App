import Transaction from "../models/transaction.model.js";

const transactionResolver = {
  // take a look at the schema: transaction.typeDef.js
  Query: {
    transactions: async (_, __, context) => {
      try {
        // if the res of context.getUser() is empty, the user is unauthorized
        if (!context.getUser()) throw new Error("Unauthorized");
        const userId = await context.getUser()._id;

        const transactions = await Transaction.find({ userId });
        return transactions;
      } catch (err) {
        console.error("Error getting transactions:", err);
        throw new Error("Error getting transactions");
      }
    },
    // get one transaction
    transaction: async (_, { transactionId }) => {
      try {
        const transaction = await Transaction.findById(transactionId);
        return transaction;
      } catch (err) {
        console.error("Error getting transaction:", err);
        throw new Error("Error getting transaction");
      }
    },

    // TODO: ADD categoryStatistics query
  },
  Mutation: {
    // async(parent, args, context)
    // input: CreateTransactionInput
    createTransaction: async (_, { input }, context) => {
      try {
        const newTransaction = new Transaction({
          ...input,
          userId: context.getUser()._id, // this transaction is associated with this user
        });
        await newTransaction.save(); // save to the database
        return newTransaction;
      } catch (err) {
        console.error("Error creating transaction:", err);
        throw new Error("Error creating transaction");
      }
    },

    // input: UpdateTransactionInput
    updateTransaction: async (_, { input }) => {
      try {
        const updatedTransaction = await Transaction.findByIdAndUpdate(
          input.transactionId, // update the transaction by updating the ID
          input,
          {
            new: true, // will instead give you the object after updae was applied
          }
        );
        return updatedTransaction;
      } catch (err) {
        console.error("Error updating transaction:", err);
        throw new Error("Error updating transaction");
      }
    },

    // delete transaction
    deleteTransaction: async (_, { transactionId }) => {
      try {
        const deletedTransaction = await Transaction.findByIdAndDelete(
          transactionId
        );
        return deletedTransaction;
      } catch (err) {
        console.error("Error deleting transaction:", err);
        throw new Error("Error deleting transaction");
      }
    },
  },

  // Add Transaction/user relationship
  // Transaction: {
  //   user: async (parent) => {
  //     const userId = parent.userId;
  //     try {
  //       const user = await User.findById(userId);
  //       return user;
  //     } catch (err) {
  //       console.error("Error getting user:", err);
  //       throw new Error("Error getting user");
  //     }
  //   },
  // },
};

export default transactionResolver;

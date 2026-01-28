import { getAuth } from "firebase/auth";
import { doc, getDoc, getFirestore, setDoc, updateDoc } from "firebase/firestore";

export interface ClaimOfferResult {
  success: boolean;
  message: string;
}

/**
 * Checks eligibility and claims the free cash offer in one function
 * Returns success status and a message for UI feedback
 */
export async function claimFreeOfferIfEligible(): Promise<ClaimOfferResult> {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) {
      console.log("No user logged in");
      return {
        success: false,
        message: "Please log in first"
      };
    }
    
    const db = getFirestore();
    const userRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userRef);
    
    // Check eligibility
    const hasAlreadyClaimed = userDoc.exists() && userDoc.data()?.hasClaimedFreeCash;
    
    if (hasAlreadyClaimed) {
      return {
        success: false,
        message: "You have already claimed this offer"
      };
    }
    
    const timestamp = new Date();
    
    // Create transaction data that matches the wallet transaction format
    const transactionData = {
      userId: user.uid,
      amount: 10*100,
      type: 'credit',
      status: 'completed',
      description: 'Welcome Bonus: $10 Free Cash',
      createdAt: timestamp,
      updatedAt: timestamp,
      paymentMethod: 'promotion',
      referenceId: `promo-${timestamp.getTime()}`
    };
    
    // Add the amount to wallet balance and mark as claimed
    if (userDoc.exists()) {
      const userData = userDoc.data();
      const currentBalance = (userData?.walletBalance as number) || 0;
      const newBalance = currentBalance + 10*100;
      
      // Update user document with new wallet balance
      await updateDoc(userRef, {
        walletBalance: newBalance,
        hasClaimedFreeCash: true,
        lastUpdated: timestamp
      });
    } else {
      // Create a new user document if it doesn't exist
      await setDoc(userRef, {
        email: user.email,
        name: user.displayName,
        walletBalance: 10*100,
        hasClaimedFreeCash: true,
        createdAt: timestamp,
        lastUpdated: timestamp
      });
    }
    
    // Add the transaction to walletTransactions collection
    const transactionRef = doc(db, "walletTransactions", `promo-${timestamp.getTime()}`);
    await setDoc(transactionRef, transactionData);
    
    return {
      success: true,
      message: "$10 free credit claimed successfully!"
    };
  } catch (error) {
    console.error("Error claiming free offer:", error);
    return {
      success: false,
      message: "Failed to claim offer. Please try again."
    };
  }
}
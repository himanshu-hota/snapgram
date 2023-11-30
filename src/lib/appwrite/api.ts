import { INewUser } from "@/types";
import { ID, Query } from "appwrite";
import { account,  appwriteConfig, avatars, databases } from "./config";

export const createUserAccount = async (user:INewUser) => {
    try {
        const newAccount = await account.create(
          ID.unique(),
          user.email,
          user.password,
          user.name,
          
        );

        if(!newAccount){
            throw Error;
        }

        const avatarUrl = avatars.getInitials(user.name);

        console.log(avatarUrl);

        const newUser = await saveUserToDB({
          accountId: newAccount.$id,
          name: newAccount.name,
          email: newAccount.email,
          username: user.username,
          imageUrl: avatarUrl,
        });


        return newUser;
    } catch (err) {
        console.log(err);
        return err;
    }
}

export async function saveUserToDB(user: {
  accountId: string;
  email: string;
  name: string;
  imageUrl: URL;
  username?: string;
}) {
  try {
    const newUser = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      ID.unique(),
      user
    );

    return newUser;
  } catch (error) {
    console.log(error);
  }
}

export const signInAccount = async (user:{email:string;password:string}) => {
    try {
        const session = await account.createEmailSession(user.email,user.password);
        return session;
    } catch (err) {
        console.log(err);
    }
}

export const signOutAccount = async () => {
  try {
    const session = await account.deleteSession('current');
    
    return session;
  } catch (err) {
    console.log(err);
  }
};

export const getCurrentUser = async () => {
    try {
        const currentAccount = await account.get();

        if(!account) throw Error;

        const currentUser = await databases.listDocuments(
          appwriteConfig.databaseId,
          appwriteConfig.userCollectionId,
          [Query.equal("accountId", currentAccount.$id)]
        );

        if(!currentUser) throw Error;

        return currentUser.documents[0];
    } catch (err) {
        console.log(err);
    }
}
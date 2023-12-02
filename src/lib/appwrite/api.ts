import { INewPost, INewUser } from "@/types";
import { ID, Query } from "appwrite";
import { account, appwriteConfig, avatars, databases, storage } from "./config";

export const createUserAccount = async (user: INewUser) => {
  try {
    const newAccount = await account.create(
      ID.unique(),
      user.email,
      user.password,
      user.name
    );

    if (!newAccount) {
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
};

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

export const signInAccount = async (user: {
  email: string;
  password: string;
}) => {
  try {
    const session = await account.createEmailSession(user.email, user.password);
    return session;
  } catch (err) {
    console.log(err);
  }
};

export const signOutAccount = async () => {
  try {
    const session = await account.deleteSession("current");

    return session;
  } catch (err) {
    console.log(err);
  }
};

export const getCurrentUser = async () => {
  try {
    const currentAccount = await account.get();

    if (!account) throw Error;

    const currentUser = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      [Query.equal("accountId", currentAccount.$id)]
    );

    if (!currentUser) throw Error;

    return currentUser.documents[0];
  } catch (err) {
    console.log(err);
  }
};

export const uploadFile = async (file: File) => {
  try {
    const uploadedFile = await storage.createFile(
      appwriteConfig.storageId,
      ID.unique(),
      file
    );

    return uploadedFile;
  } catch (err) {
    console.log(err);
  }
};

export const getFilePreview = async (fileId: string) => {
  try {
    const fileUrl = storage.getFilePreview(
      appwriteConfig.storageId,
      fileId,
      2000,
      2000,
      "top",
      100
    );

    return fileUrl;
  } catch (err) {
    console.log(err);
  }
};

export const deleteFile = async (fileId: string) => {
  try {
    await storage.deleteFile(appwriteConfig.storageId, fileId);

    return { status: "ok" };
  } catch (error) {
    console.log(error);
  }
};

export const createPost = async (post: INewPost) => {
  try {
    // upload image
    const uploadedFile = await uploadFile(post.file[0]);

    if (!uploadedFile) throw Error;

    // get url

    const fileUrl = getFilePreview(uploadedFile.$id);

    if (!fileUrl) {
      await deleteFile(uploadedFile.$id);
      throw Error;
    }

    // convert tags to array
    const tags = post.tags?.replace(/ /g,'').split(',') || [];

    // save to databse
    const newPost = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      ID.unique(),
      {
        creator:post.userId,
        caption:post.caption,
        imageUrl:fileUrl,
        imageId:uploadedFile.$id,
        location:post.location,
        tags:tags
      } 
    )

    if(!newPost){
      await deleteFile(uploadedFile.$id);
      throw Error;
    }

    return newPost;

  } catch (err) {
    console.log(err);
  }
};

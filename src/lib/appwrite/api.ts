import { INewPost, INewUser, IUpdatePost } from "@/types";
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

export const getFilePreview =  (fileId: string) => {
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

export const getRecentPosts = async () => {

  const posts = await databases.listDocuments(
    appwriteConfig.databaseId,
    appwriteConfig.postCollectionId,
    [Query.orderDesc(`$createdAt`), Query.limit(20)]
  );

  if(!posts) throw Error;

  return posts;
  
}

export const likePost = async (postId:string,likesArray:string[]) => {
  try {
      const updatedPost = await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.postCollectionId,
        postId,
        {
          likes:likesArray
        }
      );

      if(!updatedPost) throw Error;

      return updatedPost;
  } catch (err) {
    console.log(err);
  }
}

export const savePost = async (postId: string, userId: string) => {
  try {
    const updatedPost = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.savesCollectionId,
      ID.unique(),
      {
        user:userId,
        post:postId
      }
    );

    if (!updatedPost) throw Error;

    return updatedPost;
  } catch (err) {
    console.log(err);
  }
};

export const deletesSavedPost = async (savedRecordId:string) => {
  try {

    console.log(savedRecordId);

    const statusCode = await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.savesCollectionId,
      savedRecordId
    );

    if (!statusCode) throw Error;

    return {status:'ok'};
  } catch (err) {
    console.log(err);
  }
};


export const getPostById = async (postId:string) => {
  try {
    
    const post = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      postId
    );


    return post; 

  } catch (err) {
    console.log(err);
  }
}

export const updatePost = async (post: IUpdatePost) => {
  
  const hasFileToUpdate = post.file.length > 0;
  
  try {

    let image = {
      imageUrl:post.imageUrl,
      imageId:post.imageId
    }

    if(hasFileToUpdate){
      // upload image
      const uploadedFile = await uploadFile(post.file[0]);

      if (!uploadedFile) throw Error;

      // get url

      const fileUrl = getFilePreview(uploadedFile.$id);

      if (!fileUrl) {
        await deleteFile(uploadedFile.$id);
        throw Error;
      }

      image = { ...image, imageUrl: fileUrl, imageId: uploadedFile.$id };
    }

    

    // convert tags to array
    const tags = post.tags?.replace(/ /g, "").split(",") || [];

    // save to databse
    const updatedPost = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      post.postId,
      {
        caption: post.caption,
        imageUrl: image.imageUrl,
        imageId: image.imageId,
        location: post.location,
        tags: tags,
      }
    );

    if (!updatedPost) {
      await deleteFile(post.imageId);
      throw Error;
    }

    return updatedPost;
  } catch (err) {
    console.log(err);
  }
};


export const deletePost = async (postId:string,imageId:string) => {
  
  if(!postId || !imageId) throw Error;

  try {
    await databases.deleteDocument(appwriteConfig.databaseId,appwriteConfig.postCollectionId,postId);

    return {status:'ok'};
  } catch (err) {
    console.log(err);
  }

}


export const getInfinitePosts = async ({pageParam} : {pageParam:number}) => {
  
  const queries:any[] = [Query.orderDesc('$updatedAt'), Query.limit(10)];

  if(pageParam){
    queries.push(Query.cursorAfter(pageParam.toString()));
  }

  try {
    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      queries
    )

    if(!posts) throw Error;

    return posts;

  } catch (err) {
    console.log(err);
  }

}

export const searchPosts = async (searchTerm:string) => {
  
  try {
    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      [Query.search('caption',searchTerm)]
    );

    if (!posts) throw Error;

    return posts;
  } catch (err) {
    console.log(err);
  }
};
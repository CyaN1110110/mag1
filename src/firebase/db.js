// src/firebase/db.js
import {
  collection,
  doc,
  getDoc,
  setDoc,
  addDoc,
  query,
  where,
  getDocs,
  orderBy,
  updateDoc,
  deleteDoc,
  arrayUnion,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from './config';

// ==================== USERS ====================
export const createUserProfile = async (userId, userData) => {
  try {
    await setDoc(doc(db, 'users', userId), {
      ...userData,
      isAdmin: false,
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
};

export const getUserProfile = async (userId) => {
  try {
    const docSnap = await getDoc(doc(db, 'users', userId));
    return docSnap.exists() ? docSnap.data() : null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
};

export const updateUserLastLogin = async (userId) => {
  try {
    await updateDoc(doc(db, 'users', userId), {
      lastLogin: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating last login:', error);
  }
};

export const checkIsAdmin = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    return userDoc.exists() && userDoc.data().isAdmin === true;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};

// ==================== POSTS ====================
export const createPost = async (postData, images) => {
  try {
    const batch = writeBatch(db);
    
    // 이미지 업로드
    const uploadedImages = [];
    for (let i = 0; i < images.length; i++) {
      const imageFile = images[i].file;
      const storageRef = ref(storage, `posts/${Date.now()}_${i}_${imageFile.name}`);
      
      await uploadBytes(storageRef, imageFile);
      const downloadURL = await getDownloadURL(storageRef);
      
      uploadedImages.push({
        url: downloadURL,
        link: images[i].link || '',
        order: i,
      });
    }

    // 포스트 문서 생성
    const postsRef = collection(db, 'posts');
    const newPostRef = doc(postsRef);
    
    batch.set(newPostRef, {
      ...postData,
      images: uploadedImages,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    await batch.commit();
    return newPostRef.id;
  } catch (error) {
    console.error('Error creating post:', error);
    throw error;
  }
};

export const getPosts = async (limit = 20) => {
  try {
    const postsQuery = query(
      collection(db, 'posts'),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(postsQuery);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Error getting posts:', error);
    throw error;
  }
};

export const getPostById = async (postId) => {
  try {
    const docSnap = await getDoc(doc(db, 'posts', postId));
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
  } catch (error) {
    console.error('Error getting post:', error);
    throw error;
  }
};

export const deletePost = async (postId) => {
  try {
    // 먼저 포스트 문서 가져오기
    const post = await getPostById(postId);
    
    if (post) {
      // 모든 이미지 삭제
      for (const image of post.images) {
        const imageRef = ref(storage, image.url);
        await deleteObject(imageRef);
      }
    }

    // 포스트 문서 삭제
    await deleteDoc(doc(db, 'posts', postId));
  } catch (error) {
    console.error('Error deleting post:', error);
    throw error;
  }
};

// ==================== ACTIVITY ====================
export const logActivity = async (userId, activityData) => {
  try {
    const userActivityRef = collection(db, 'activity', userId, 'logs');
    await addDoc(userActivityRef, {
      ...activityData,
      timestamp: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error logging activity:', error);
  }
};

export const getUserActivity = async (userId) => {
  try {
    const activityQuery = query(
      collection(db, 'activity', userId, 'logs'),
      orderBy('timestamp', 'desc')
    );
    const snapshot = await getDocs(activityQuery);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Error getting user activity:', error);
    throw error;
  }
};

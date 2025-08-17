import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  limit,
  increment,
  arrayUnion,
  arrayRemove,
  Timestamp,
} from "firebase/firestore"
import { db } from "./firebase"

export interface Prompt {
  id: string
  title: string
  description: string
  prompt: string
  tags: string[]
  authorId: string
  authorName: string
  authorAvatar?: string
  likes: number
  views: number
  likedBy: string[]
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface PromptInput {
  title: string
  description: string
  prompt: string
  tags: string[]
}

// Prompts collection functions
export const createPrompt = async (promptData: PromptInput, userId: string, userName: string) => {
  const promptsRef = collection(db, "prompts")
  const newPrompt = {
    ...promptData,
    authorId: userId,
    authorName: userName,
    likes: 0,
    views: 0,
    likedBy: [],
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  }

  const docRef = await addDoc(promptsRef, newPrompt)
  return docRef.id
}

export const getPrompts = async (limitCount = 20) => {
  const promptsRef = collection(db, "prompts")
  const q = query(promptsRef, orderBy("createdAt", "desc"), limit(limitCount))
  const snapshot = await getDocs(q)

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Prompt[]
}

export const getTrendingPrompts = async (limitCount = 10) => {
  const promptsRef = collection(db, "prompts")
  const q = query(promptsRef, orderBy("likes", "desc"), limit(limitCount))
  const snapshot = await getDocs(q)

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Prompt[]
}

export const searchPrompts = async (searchTerm: string, limitCount = 20) => {
  const promptsRef = collection(db, "prompts")
  const snapshot = await getDocs(promptsRef)

  // Client-side filtering for simplicity (in production, use Algolia or similar)
  const allPrompts = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Prompt[]

  const filtered = allPrompts.filter(
    (prompt) =>
      prompt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prompt.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prompt.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  return filtered.slice(0, limitCount)
}

export const getPromptsByUser = async (userId: string) => {
  const promptsRef = collection(db, "prompts")
  const q = query(promptsRef, where("authorId", "==", userId), orderBy("createdAt", "desc"))
  const snapshot = await getDocs(q)

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Prompt[]
}

export const likePrompt = async (promptId: string, userId: string) => {
  const promptRef = doc(db, "prompts", promptId)
  await updateDoc(promptRef, {
    likes: increment(1),
    likedBy: arrayUnion(userId),
  })
}

export const unlikePrompt = async (promptId: string, userId: string) => {
  const promptRef = doc(db, "prompts", promptId)
  await updateDoc(promptRef, {
    likes: increment(-1),
    likedBy: arrayRemove(userId),
  })
}

export const incrementViews = async (promptId: string) => {
  const promptRef = doc(db, "prompts", promptId)
  await updateDoc(promptRef, {
    views: increment(1),
  })
}

export const getPromptById = async (promptId: string): Promise<Prompt | null> => {
  const promptRef = doc(db, "prompts", promptId)
  const snapshot = await getDoc(promptRef)

  if (snapshot.exists()) {
    return {
      id: snapshot.id,
      ...snapshot.data(),
    } as Prompt
  }

  return null
}

export const updatePrompt = async (promptId: string, updates: Partial<PromptInput>) => {
  const promptRef = doc(db, "prompts", promptId)
  await updateDoc(promptRef, {
    ...updates,
    updatedAt: Timestamp.now(),
  })
}

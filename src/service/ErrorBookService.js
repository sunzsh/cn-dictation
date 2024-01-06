import { findBookByChar, findCharObjs } from '@/service/BookService'

const STORAGE_KEY_PRE = 'error_book_'

function getBookKeyByChar(char) {
  const book = findBookByChar(char)
  if (!book) {
    return null
  }
  return `${book.grade}${book.term}`
}

function getStorageKeyByChar(char) {
  const bookKey = getBookKeyByChar(char)
  if (!bookKey) {
    return null
  }
  return `${STORAGE_KEY_PRE}${bookKey}`
}
function getErrorBookByKey (storageKey) {
  if (!storageKey) {
    return null
  }
  const errorChars = localStorage.getItem(storageKey)
  if (!errorChars) {
    return null;
  }
  return JSON.parse(errorChars)
}

// --------- 对外暴露的方法 ------------

export function addErrorChar (char) {
  const bookKey = getStorageKeyByChar(char)
  if (!bookKey) {
    console.error('每有找到对应的书籍');
    return;
  }
  const errorBook = getErrorBookByKey(bookKey) || [];
  if (errorBook.indexOf(char) === -1) {
    errorBook.push(char)
  }
  localStorage.setItem(bookKey, JSON.stringify(errorBook))
}

export function removeErrorChar (char) {
  const bookKey = getStorageKeyByChar(char)
  if (!bookKey) {
    console.error('每有找到对应的书籍');
    return;
  }
  const errorBook = getErrorBookByKey(bookKey);
  if (!errorBook) {
    return
  }
  const index = errorBook.indexOf(char)
  if (index !== -1) {
    errorBook.splice(index, 1)
  }
  if (errorBook.length === 0) {
    localStorage.removeItem(bookKey)
    return
  }
  localStorage.setItem(bookKey, JSON.stringify(errorBook))
}

export function getErrorCharsByBook (book) {
  if (!book) {
    return null;
  }
  const bookKey = `${STORAGE_KEY_PRE}${book.grade}${book.term}`
  const errorChars = getErrorBookByKey(bookKey) || []
  if (errorChars.length === 0) {
    return []
  }
  return findCharObjs(errorChars)
}

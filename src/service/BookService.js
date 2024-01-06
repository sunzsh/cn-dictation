import BOOKS from '@/books'

export function findBookByChar(char) {
  for (const book of BOOKS) {
    for (const klass of book.klasses) {
      if (klass.newChars.find((c) => c.newChar === char)) {
        return book
      }
    }
  }
  return null
}

export function findCharObj(char) {
  for (const book of BOOKS) {
    for (const klass of book.klasses) {
      const charObj = klass.newChars.find((c) => c.newChar === char)
      if (charObj) {
        return charObj
      }
    }
  }
  return null
}

export function findCharObjs(chars) {
  const charObjs = []
  for (const char of chars) {
    const charObj = findCharObj(char)
    if (charObj) {
      charObjs.push(charObj)
    }
  }
  return charObjs
}
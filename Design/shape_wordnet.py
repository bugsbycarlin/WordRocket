

from nltk.corpus import wordnet as wn


def isShape(word):
  syns = wn.synsets(word, pos = wn.NOUN)
  for syn in syns:
    if 'shape' in syn.lexname():
      return True
  return False

with open("shape_wordnet.txt", "w") as shape_file:
  with open("legal_words.txt", "r") as word_file:
    for line in word_file.readlines():
      word = line.split(",")[0]
      if isShape(word):
        shape_file.write(word + "\n")

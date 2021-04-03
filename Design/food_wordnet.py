

from nltk.corpus import wordnet as wn


def isFood(word):
  syns = wn.synsets(word, pos = wn.NOUN)
  for syn in syns:
    if 'food' in syn.lexname():
      return True
  return False

with open("food_draft.txt", "w") as food_file:
  with open("legal_words.txt", "r") as word_file:
    for line in word_file.readlines():
      word = line.split(",")[0]
      if isFood(word):
        food_file.write(word + "\n")


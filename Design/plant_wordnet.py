

from nltk.corpus import wordnet as wn


def isplant(word):
  syns = wn.synsets(word, pos = wn.NOUN)
  for syn in syns:
    if 'plant' in syn.lexname():
      return True
  return False

with open("plant_dictionary.txt", "w") as plant_file:
  with open("legal_words.txt", "r") as word_file:
    for line in word_file.readlines():
      word = line.split(",")[0]
      if isplant(word):
        plant_file.write(word + "\n")

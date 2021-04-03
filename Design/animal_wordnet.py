

from nltk.corpus import wordnet as wn


def isAnimal(word):
  syns = wn.synsets(word, pos = wn.NOUN)
  for syn in syns:
    if 'animal' in syn.lexname():
      return True
  return False

with open("animal_dictionary_second_draft.txt", "w") as animal_file:
  with open("legal_words.txt", "r") as word_file:
    for line in word_file.readlines():
      word = line.split(",")[0]
      if isAnimal(word):
        animal_file.write(word + "\n")


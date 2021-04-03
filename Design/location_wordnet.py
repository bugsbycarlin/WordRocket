
from nltk.corpus import wordnet as wn


def islocation(word):
  syns = wn.synsets(word, pos = wn.NOUN)
  for syn in syns:
    if 'location' in syn.lexname():
      return True
  return False

with open("location_draft.txt", "w") as location_file:
  with open("legal_words.txt", "r") as word_file:
    for line in word_file.readlines():
      word = line.split(",")[0]
      if islocation(word):
        location_file.write(word + "\n")


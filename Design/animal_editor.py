
import collections

words = {}
with open("animal_dictionary_first_draft.txt", "r") as color_file:
  for line in color_file.readlines():
    word = line.lower().strip().split(" ")[0]
    words[word] = 1

word_list = list(words.keys())
word_list.sort()
with open("animal_dictionary.txt", "w") as color_out_file:
  for word in word_list:
    color_out_file.write(word + "\n")
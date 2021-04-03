
import collections

words = {}
with open("color_dictionary.txt", "r") as color_file:
  for line in color_file.readlines():
    word = line.lower().strip()
    words[word] = 1

word_list = collections.OrderedDict(words)
with open("color_dictionary.txt", "w") as color_out_file:
  for key,value in word_list.items():
    color_out_file.write(key + "\n")

import collections

count = 0


with open("legal_words.txt", "r") as word_file:
  for line in word_file.readlines():
    word = line.split(",")[0]
    if len(word) >= 4 and word[::-1] == word:
      count += 1
      print(word)

print("There are %d palindromes." % count)
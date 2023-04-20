predictions = {}
for i in range(7):
    predictions[i] = {}

for i in range(7):
    for j in range(24):
        predictions[i][j] = "wow"


for key in predictions:
   print ("key: %s , value: %s" % (key, predictions[key]))

number = 4
for key in predictions:
    if key == 4:
        print("Key is 4")
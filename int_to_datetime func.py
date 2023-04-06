from datetime import datetime
#represents integer stored in database
a = datetime.timestamp(datetime.now())
print(a)
a = 1677760064
#converts database integer to datetime format
b = datetime.fromtimestamp(a)
print(b)

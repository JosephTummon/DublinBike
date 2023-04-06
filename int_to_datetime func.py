from datetime import datetime
#represents integer stored in database
a = datetime.timestamp(datetime.now())
print(a)

#converts database integer to datetime format
b = datetime.fromtimestamp(a)
print(b)

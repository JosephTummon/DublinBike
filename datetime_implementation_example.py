from datetime import datetime
now = datetime.now()#datetime
print(now)

timestamp = datetime.timestamp(now) #int
print(timestamp)

dt_object= datetime.fromtimestamp(timestamp) #object
print(type(dt_object))
print(dt_object)

print(datetime.timestamp(now))

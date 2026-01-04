#This is a function used to generate the data for the samples used
import json



def dictCreator(Id, title, address, schedule, mainImage, moreImages, description, minPrice,reel, ownerId, eventType):
    dict = {}
    dict['id'] = Id
    dict['eventTitle'] = title
    dict['ownerId'] = ownerId
    dict['eventType'] = eventType
    dict['description'] = description
    dict['address'] = address
    dict['schedule'] = schedule #This is a dictionary containing the times when the business is open 
    dict['mainImage'] = mainImage
    dict['moreImages'] = moreImages #This is an array with links to the additional pictures of the business
    dict['minPrice'] = minPrice
    dict['reel'] = reel #An array with all the links of the videos

    return dict

def timeGenerator(day):
    startTimeHour = int(input('Please enter your ' +day+' starting hour :  '))
    startTimeMin = int(input('Please enter your '+ day +' starting minute:  '))
    endTimeHour = int(input('Please enter your ' +day+' end hour:  '))
    endTimeMin = int(input('Please enter your '+day+' end minute:  '))
    schedule = str(startTimeHour) + ':' + str(startTimeMin) + '-' + str(endTimeHour) + ':' + str(endTimeMin)
    print(schedule)
    return schedule

def createSchedule():
    schedule = {}
    usual = timeGenerator('Weekdays')
    schedule['Monday'] = usual
    schedule['Tuesday'] = usual
    schedule['Wednesday'] = usual
    schedule['Thrusday'] = usual
    schedule['Friday'] = usual
    schedule['Saturday'] = timeGenerator('Saturday')
    schedule['Sunday'] = timeGenerator('Sunday')

    return schedule

def addImages():
    data = []
    for x in range(3):
        image = input('Please enter the URL of the image you want to add: ')
        data.append(image)
    return data

def addReel():
    data = []
    for x in range(3):
        reel = input('Please enter the URL of the reel you want to add: ')
        data.append(reel)
    return data

        
    

def inputFunc():
    #This function prompts the user to imput some data and return the all the data in an array so that it can be dismantled to be added to the dictCreator
    Id = int(input("Please enter the id of the event to add  "))
    eventTitle = input("Please enter the title of the event to add  ")
    address = input("Please enter the address of the event to add  ")
    description = input("Please enter the description of the event to add  ")
    mainImage = input('Please enter the url of the first image you want to add  ')
    minPrice = float(input("Please enter the minimum price of your event  "))
    schedule = createSchedule()
    moreImages = addImages()
    reel = addReel()
    eventType = input("Please enter the type of the event to add  ")
    ownerId = input("Please enter the owner Id  ")

    return [Id,eventTitle,address,description,mainImage,schedule, moreImages, minPrice, reel, ownerId, eventType]



def addData():
    AllData = []
    data = inputFunc()
    dataDict = dictCreator(data[0],data[1],data[2],data[5],data[4],data[6],data[3],data[7], data[8], data[9],data[10])
    AllData.append(dataDict)
    with open('samples.json', 'a') as json_file:
        for entry in AllData:
            json_string = json.dumps(entry)
            json_file.write(json_string +'\n')



#Lets get to work

for x in range(6):
    addData()
    print("This us number " , x)


    


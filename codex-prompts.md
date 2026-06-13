#Prompt 1
hey code i want you to create mongo db models for my restraunt application in the folder Backend\models user collection like
this
{ \_id,
name,
email,
password,
role: "admin",
createdAt
} menu collection like this
{ \_id,
name,
description,
price,
category,
isAvailable,
createdAt
} and order collection is like this
{ \_id,

    customerName,

    items: [
      {
        menuItemId,
        name,
        quantity,
        price
      }
    totalAmount,

    status: "Pending",

#prompt 2
I've setup implementing Register controller with jwt and bcrypt take it as inspiration and complete the login controller

#prompt3

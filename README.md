
# Snap! Web Hosting (Version 2)

##### Seneca College ***WEB322 Assignment 5***

##### Created using `HTML/CSS (Bootstrap 5.2)`, `Javascript`, `Handlebars`

##### User administrator access via `MongoDB` & `Express-session`

##### Link to Cyclic App: [Snap!](https://snap2.cyclic.app)

```
Todo 
==========
==> Implement `Express-session` ✅
==> If a user if logged in then:
==>   Display user pfp and usename in navbar ✅
==>   Right most of the navbar ✅
==>   Replace 'login' link with user drop down options ✅
==>   Remove the 'register' link ✅
==>   Logout link (under user dropdown) will logout user and redirect to /home
---------------------------------
==> Articles filter by categories
---------------------------------
==> Allow `isAdmin` user to:
==>   Add/remove articles
==>   Edit any articles
==>   Change the article's image...
==>     Article image can only be an image
==>     Such as (.jpg, .jpeg, .png, .gif)
==> Admin user will display 'Admin' on user dashboard ✅
--------------------------------
==> Logged in user to be able to change:
==>   Username, fullname, profile picture (user/dash/edit)
==>   Add a "Edit profile" button for that ✅
--------------------------------
==> Forgot password (for now just ask user 2+2)...
==>   Then promt the user to update their password.
--------------------------------
==> Implement 'Remember-me"
--------------------------------
==> Implement a register 'Upload Image (jpeg/jpg/png)
--------------------------------
==> Allow users to sign in with username or email


Change Log
==========
11/11/22 - Assignment 4 complete
11/13/22 - Started Assignment 5
11/14/22 - Moved: express-sessions & body-parser to server.js from user.js
11/14/22 - Changed 'Users-Test' => 'Users' in const User (user.js)
11/14/22 - If user is not logged when accessing their dashboard it will redirect to login
11/14/22 - User dashboard navbar now has user drop down options rather than 'login/register' links
11/14/22 - Admin user displays 'Admin' (red) on user dashboard
11/15/22 - Index now shows logged in user info on navbar
11/15/22 - Added control buttons to index carousel
```


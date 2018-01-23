[![General Assembly Logo](https://camo.githubusercontent.com/1a91b05b8f4d44b5bbfb83abac2b0996d8e26c92/687474703a2f2f692e696d6775722e636f6d2f6b6538555354712e706e67)](https://generalassemb.ly/education/web-development-immersive)

# Game-Tracker

A JavaScript based web application that allows users to find out information
about the latest games, dlc, and expansions that are out or coming out.

Users can add content they want to their personal wishlist and can see what all
other users have added to thier wishlist using the games table.

User's can register to have the ability to sign in, out, change password, and
save their list.

## Dependencies

Install with `npm install`.

-   [Webpack](https://webpack.github.io)
-   [Bootstrap](http://getbootstrap.com)
-   [Handlebars.js](http://handlebarsjs.com)

## Technologies Used

1.Bootstrap
2.Handlebars
3.DataTables

## How to use

There are 3 different tables in the app.
  1. A list of all games that gets updated based on the current date and
     popularity of the games.
  2. A total collection of games that have ever been added to a User's wishlist.
  3. The User's personal wishlist.

Once a user is signed-in, they can begin adding games to their wishlist.

Games can be added from either the "games" table or the "games on other users
wishlists" table.

To add a game to the wishlist, a user simply needs to click on a game then
click the "add to wishlist" button at the top of the table.

User's can also double-click on a game to view a cover photo of the game, as
well as the summary and storyline if available. User's can also add the games
to their wishlist from this view.

If the user is the first to add the game to thier wishlist it will automatically
be added to the "games on other user's wishlist" table for all other users to see.

The process of removing a game from your wishlist is similar to adding one.

The user can click on the game then click the delete button, or they can
double-click on the game and click the delete button from there.

Removing a game from your wishlist will not remove the game from the "other
users wishlist" table.

## Links

[`Deployed Web App`](https://fcarrion001.github.io/game-tracker-client/)
[`API`](https://github.com/Fcarrion001/gamer-api) repo created by me that is used by this app.


## [License](LICENSE)

1.  All content is licensed under a CC­BY­NC­SA 4.0 license.
1.  All software code is licensed under GNU GPLv3. For commercial use or
    alternative licensing, please contact legal@ga.co.

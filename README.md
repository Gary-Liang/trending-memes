# Trending Memes
https://www.trendingmemes.org/ 

## Description

TrendingMemes is a full-stack web application that leverages the Imgur API to fetch viral videos or images that are currently trending based on user activity within the past 2 weeks on Imgur. Users can sign up and save their favorite memes for future reference in the "Saved Memes" section. <br>

<p align="center">
  <img src="https://github.com/Gary-Liang/trending-memes/assets/51287164/b3b487c8-0062-43ba-88b5-4dea811e9fd9" width="600" height="500" />
</p>



## Technologies Used
### Frontend
- Node.js
- Reactjs 
- Netlify cloud platform
### Backend
- Python 3
- Imgur API
- Flask 
- Redis
- MongoDB
- OAuth 2.0 Authorization Code Flow Protocol
- Railway App cloud platform

## Features 
- User account creation with password encryption using the HS256 algorithm with JSON Web Tokens (JWT). User information and favorite memes are stored and fetched from a MongoDB database.
- Search functionality allows users to search for a collection of viral videos/images within the past 2 weeks by making API calls to Imgur's gallery search filter. OAuth authentication for accessing the API is handled in the backend.
- Save and unsave memes using the favorites button. The button sends a POST request with a Bearer Authorization token to validate and save the media in the user's profile.
- Full window view for media content with an option to save it to the clipboard.

## Future Add-ons
- Integration of the Reddit API to fetch trending feeds from Reddit.
- Page count footer to load more results.
- Sort by Month/Year option.
- User account settings. 

## Usage
1. Visit https://www.trendingmemes.org/.
2. Login or register a new account.
3. Explore various media albums and videos by clicking on the containers to view them in full screen.
4. Use the search bar to discover random viral content that occurred in the past two weeks (e.g., "cats", "funny", "viral").
5. If you find something you like, exit the full screen view and click on the star icon on the container to favorite it.
6. Click on the "Saved Memes" button in the navigation bar to access your saved memes.


## Disclaimer
This project is for demonstration purposes only and is not intended for commercial use. The project is provided as-is and the developer is not responsible for any issues or damages that may arise from its use.

## Credits 
- Gary Liang (https://gary-liang.github.io/)



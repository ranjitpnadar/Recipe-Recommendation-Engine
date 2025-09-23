# Recipe AI Assistant - React Application

A modern, interactive Recipe AI Assistant built with React that allows users to chat with an AI for recipe suggestions, manage their personal recipe collection, and maintain a comprehensive cooking companion.

## 🚀 Features

### Chat Interface
- **AI-Powered Recipe Assistant**: Chat with an AI that provides recipe suggestions, cooking tips, and food-related advice
- **Real-time Messaging**: Interactive chat interface similar to ChatGPT
- **Search History**: Sidebar displays recent searches for easy access
- **New Chat Sessions**: Start fresh conversations anytime

### Recipe Management
- **Personal Recipe Collection**: Add, edit, view, and delete your own recipes
- **Detailed Recipe Information**: Include ingredients, instructions, prep time, cook time, servings, cuisine type, and difficulty level
- **Recipe Images**: Support for recipe images via URL
- **Public/Private Recipes**: Option to make recipes public or keep them private

### User Authentication
- **User Registration & Login**: Secure authentication system
- **User Profiles**: Manage personal information and profile pictures
- **Session Management**: Persistent login sessions with JWT tokens

### Modern UI/UX
- **Dark Theme Chat Interface**: Sleek, modern design inspired by ChatGPT
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Modal-Based Navigation**: Clean, organized user interface
- **Interactive Tables**: Sortable and actionable recipe tables

## 🛠️ Technology Stack

- **Frontend**: React 18.2.0
- **State Management**: React Context API with useReducer
- **Styling**: Pure CSS with modern design patterns
- **Icons**: Font Awesome 6.0
- **API Communication**: Fetch API with custom hooks
- **Authentication**: JWT tokens with localStorage persistence

## 📁 Project Structure

```
src/
├── components/
│   ├── Sidebar/
│   │   ├── Sidebar.js
│   │   ├── SearchHistory.js
│   │   └── SidebarButtons.js
│   ├── Chat/
│   │   ├── ChatMain.js
│   │   ├── ChatHistory.js
│   │   └── ChatInput.js
│   ├── Modals/
│   │   ├── LoginModal.js
│   │   ├── RegisterModal.js
│   │   ├── ProfileModal.js
│   │   ├── RecipeModal.js
│   │   ├── RecipeDetailModal.js
│   │   ├── MyRecipesModal.js
│   │   └── ModalBase.js
│   └── common/
│       └── Button.js
├── hooks/
│   ├── useAuth.js
│   ├── useApi.js
│   └── useModal.js
├── context/
│   └── AppContext.js
├── styles/
│   └── App.css
├── App.js
└── index.js
```

## 🚀 Getting Started

### Prerequisites

- Node.js (version 14.0 or higher)
- npm or yarn package manager
- Backend API server running (see API Requirements below)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repository-url>
   cd recipe-ai-assistant
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

### Environment Setup

The application expects a backend API server running on `http://localhost:3000/api` by default. You can modify this in the `AppContext.js` file:

```javascript
api: {
  baseUrl: 'http://localhost:3000/api' // Change this to your API URL
}
```

## 🔌 API Requirements

The application requires a backend API with the following endpoints:

### Authentication
- `POST /auth/login` - User login
- `POST /users/register` - User registration
- `GET /users/:id` - Get user profile
- `PUT /users/profile` - Update user profile

### Recipes
- `GET /recipes` - Get user's recipes
- `POST /recipes` - Create new recipe
- `PUT /recipes/:id` - Update recipe
- `DELETE /recipes/:id` - Delete recipe
- `POST /recipes/search-llm` - AI recipe search

### Search History
- `GET /search-history/:userId` - Get user's search history

### Expected API Response Formats

**Login Response:**
```json
{
  "token": "jwt-token-here",
  "user_id": "user-id-here"
}
```

**Recipe Object:**
```json
{
  "recipe_id": "1",
  "title": "Recipe Title",
  "description": "Recipe description",
  "instructions": "Detailed instructions",
  "prep_time_minutes": 15,
  "cook_time_minutes": 30,
  "servings": 4,
  "image_url": "https://example.com/image.jpg",
  "cuisine_type": "Italian",
  "difficulty_level": "Medium",
  "is_public": true
}
```

## 🎨 Customization

### Styling
All styles are contained in `src/styles/App.css`. The application uses a modular CSS approach with clearly defined sections:

- **Sidebar Styles**: Dark theme navigation
- **Chat Interface**: Modern messaging UI
- **Modal Styles**: Clean, responsive popups
- **Form Elements**: Consistent input styling
- **Responsive Design**: Mobile-first breakpoints

### Adding New Features
The application is built with a modular architecture:

1. **Create new components** in the appropriate directory
2. **Add state management** through the AppContext
3. **Create custom hooks** for reusable logic
4. **Update routing** in App.js

### Color Scheme
The application uses a dark theme with these primary colors:
- **Background**: `#343541` (Chat area), `#202123` (Sidebar)
- **Text**: `#ececf1` (Primary), `#8e8ea0` (Secondary)
- **Accent**: `#10a37f` (AI messages), `#007bff` (User messages)
- **Buttons**: Various semantic colors (success, warning, danger, etc.)

## 📱 Responsive Design

The application is fully responsive with breakpoints at:
- **Desktop**: 1024px and above
- **Tablet**: 768px - 1023px
- **Mobile**: 480px - 767px
- **Small Mobile**: Below 480px

On mobile devices, the sidebar becomes collapsible and the layout adapts for touch interaction.

## 🔐 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Local Storage**: Persistent login sessions
- **Protected Routes**: Authentication required for sensitive operations
- **Input Validation**: Form validation and sanitization
- **Error Handling**: Comprehensive error handling and user feedback

## 🧪 Testing

To run tests (when available):
```bash
npm test
```

To build for production:
```bash
npm run build
```

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Popular Platforms

**Netlify:**
1. Connect your GitHub repository
2. Set build command: `npm run build`
3. Set publish directory: `build`

**Vercel:**
1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel` in your project directory
3. Follow the prompts

**GitHub Pages:**
1. Install gh-pages: `npm install --save-dev gh-pages`
2. Add to package.json:
   ```json
   "homepage": "https://yourusername.github.io/recipe-ai-assistant",
   "scripts": {
     "predeploy": "npm run build",
     "deploy": "gh-pages -d build"
   }
   ```
3. Run: `npm run deploy`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit your changes: `git commit -am 'Add new feature'`
4. Push to the branch: `git push origin feature/new-feature`
5. Submit a pull request

### Development Guidelines
- Follow React best practices
- Use functional components with hooks
- Maintain consistent code formatting
- Add comments for complex logic
- Test thoroughly before submitting

## 📋 Available Scripts

- `npm start` - Runs the app in development mode
- `npm test` - Launches the test runner
- `npm run build` - Builds the app for production
- `npm run eject` - Ejects from Create React App (one-way operation)

## 🐛 Troubleshooting

### Common Issues

**"Element type is invalid" Error:**
- Check for proper imports/exports in components
- Verify file paths and component names
- Ensure all dependencies are installed

**API Connection Issues:**
- Verify backend server is running
- Check API base URL in AppContext.js
- Confirm CORS settings on backend

**Authentication Problems:**
- Clear localStorage: `localStorage.clear()`
- Check JWT token format
- Verify API authentication endpoints

**Styling Issues:**
- Ensure App.css is properly imported
- Check for CSS class name conflicts
- Verify responsive breakpoints

### Getting Help
1. Check the browser console for detailed error messages
2. Review the component file structure
3. Verify all imports and exports
4. Check the network tab for API request issues

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Create React App** for the initial project setup
- **Font Awesome** for the icon library
- **OpenAI/ChatGPT** for UI/UX inspiration
- **React Community** for excellent documentation and resources

## 📞 Support

For support, email your-email@example.com or create an issue on GitHub.

---

**Happy Cooking! 🍳👨‍🍳👩‍🍳**
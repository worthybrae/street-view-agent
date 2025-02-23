# AI-Powered Street View Explorer

![preview](https://github.com/worthybrae/street-view-agent/blob/main/streetagentpreview.gif)

An interactive web application that combines Google Street View with AI analysis capabilities to enable intelligent exploration of street-level imagery. The application uses React, TypeScript, and integrates with OpenAI's API for real-time scene analysis.

## Features

- **Interactive Street View Navigation**: Full Google Street View integration with smooth transitions and panorama exploration
- **AI-Powered Analysis**: Real-time scene analysis using OpenAI's API to identify points of interest and guide exploration
- **Goal-Oriented Exploration**: Set exploration goals and let the AI guide you through relevant locations
- **Smart Navigation**: Automatically identifies and suggests optimal viewing angles and connected panoramas
- **Exploration Metrics**: Track and visualize your exploration coverage with real-time metrics
- **Activity Timeline**: Visual history of your exploration path and decisions
- **Important Notes**: AI-generated observations relevant to your exploration goals

## Tech Stack

- **Frontend**:
  - React 19
  - TypeScript
  - Vite
  - Tailwind CSS
  - shadcn/ui components
  - Google Maps API (@react-google-maps/api)
  - Lucide React icons

- **Backend**:
  - FastAPI
  - OpenAI API integration
  - Google Street View API

## Prerequisites

- Node.js (v16 or higher)
- Python 3.8+ (for backend)
- Google Maps API key
- OpenAI API key

## Setup

## Frontend Setup (Terminal 1)

1. Navigate to frontend directory and install dependencies:
```bash
cd frontend
npm install
```

2. Create a `.env` file in the frontend directory:
```env
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

3. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

## Backend Setup (Terminal 2)

1. Navigate to backend directory and install dependencies:
```bash
cd backend
pip install -r requirements.txt
```

2. Create a `.env` file in the backend directory:
```env
OPENAI_API_KEY=your_openai_api_key
GOOGLE_API_KEY=your_google_maps_api_key
```

3. Start the backend server:
```bash
uvicorn main:app --reload
```

The backend API will be available at `http://localhost:8000`

Make sure both frontend and backend servers are running simultaneously for the application to work properly.

## Project Structure

- `/src`
  - `/components` - React components
    - `/map` - Street View and map-related components
    - `/analysis` - AI analysis components
    - `/results` - Analysis results visualization
    - `/ui` - Reusable UI components
  - `/hooks` - Custom React hooks
  - `/services` - API and service integrations
  - `/types` - TypeScript type definitions
  - `/lib` - Utility functions

## Key Components

- `DirectStreetView`: Main Street View component
- `AnalysisStateManager`: Manages AI analysis state and control flow
- `ControlPanel`: User interface for exploration controls
- `ExplorationMap`: Visualizes exploration coverage
- `ActivityTimeline`: Shows exploration history
- `ImportantNotes`: Displays AI-generated observations

## Features In Detail

### AI Analysis
The application uses OpenAI's API to analyze street view scenes and provide:
- Contextual understanding of the environment
- Goal-oriented navigation suggestions
- Important observations related to user objectives
- Intelligent path planning through connected panoramas

### Navigation Controls
- Smart panorama transitions with heading optimization
- View angle suggestions based on analysis
- Automatic zoom level adjustment
- Progress tracking toward exploration goals

### Metrics and Visualization
- Real-time coverage mapping
- Action history timeline
- Important observations log
- Area exploration statistics

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details

## Acknowledgments

- Google Maps Platform for Street View API
- OpenAI for analysis capabilities
- shadcn/ui for component library
- Lucide for icons

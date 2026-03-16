import axios from 'axios';

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "https://salisense15.vercel.app",
        "https://salisense15-bd27myt42-michellepostrado26-2469s-projects.vercel.app",  # ← add yung exact URL mo
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

Yung exact Vercel URL mo ay yung nakita sa error:
```
https://salisense15-bd27myt42-michellepostrado26-2469s-projects.vercel.app

// Auto-attach JWT token sa every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Auto-redirect to login if 401
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;
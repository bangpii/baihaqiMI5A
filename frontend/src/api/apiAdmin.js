import {
    io
} from 'socket.io-client';

const API_BASE_URL = 'http://localhost:5000/api';

let socket = null;

export const initializeSocket = () => {
    if (!socket) {
        console.log('Creating new Socket.io connection...');
        socket = io('http://localhost:5000', {
            transports: ['websocket', 'polling']
        });

        socket.on('connect', () => {
            console.log('Connected to Socket.io server');
            socket.emit('join_bph_room');
            socket.emit('join_devisi_room');
            socket.emit('join_team_room');
            socket.emit('join_article_room');
            socket.emit('join_news_room');
            socket.emit('join_gallery_room');
            socket.emit('join_visimisi_room');
        });

        socket.on('disconnect', (reason) => {
            console.log('Gagal Konek:', reason);
        });

        socket.on('connect_error', (error) => {
            console.error('Gagal Konek', error);
        });

        socket.on('bph_updated', (data) => {
            console.log('BPH Update!');
        });
    }
    return socket;
};

export const getSocket = () => {
    return socket;
};

export const testConnection = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/test`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('❌ Gagal connect ke backend:', error);
        throw error;
    }
};

export const getBphData = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/bph`);
        if (!response.ok) {
            throw new Error('Failed to fetch BPH data');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('❌ Gagal fetch data BPH:', error);
        throw error;
    }
};

export const getDevisiData = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/devisi`);
        if (!response.ok) {
            throw new Error('Failed to fetch Devisi data');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('❌ Gagal fetch data Devisi:', error);
        throw error;
    }
};

export const getTeamData = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/team`);
        if (!response.ok) {
            throw new Error('Failed to fetch Team data');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('❌ Gagal fetch data Team:', error);
        throw error;
    }
};

export const getNewsData = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/news`);
        if (!response.ok) {
            throw new Error('Failed to fetch News data');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('❌ Gagal fetch data News:', error);
        throw error;
    }
};

export const getGalleryData = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/gallery`);
        if (!response.ok) {
            throw new Error('Failed to fetch Gallery data');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('❌ Gagal fetch data Gallery:', error);
        throw error;
    }
};

export const getArticleData = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/articles`);
        if (!response.ok) {
            throw new Error('Failed to fetch Article data');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('❌ Gagal fetch data Article:', error);
        throw error;
    }
};

export const getVisiMisiData = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/visimisi`);
        if (!response.ok) {
            throw new Error('Failed to fetch VisiMisi data');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('❌ Gagal fetch data VisiMisi:', error);
        throw error;
    }
};
class FirebaseService {
    constructor() {
        this.firebaseConfig = {
            apiKey: "AIzaSyDPnPz0v5QK1rQb49G7E0W3Q9qB9U1rQq8",
            authDomain: "fleet-op-9c1b8.firebaseapp.com",
            projectId: "fleet-op-9c1b8",
            storageBucket: "fleet-op-9c1b8.appspot.com",
            messagingSenderId: "1000000000000",
            appId: "1:1000000000000:web:1234567890abcdef123456"
        };
        
        this.app = null;
        this.auth = null;
        this.firestore = null;
    }
    
    init() {
        try {
            if (!this.app) {
                this.app = firebase.initializeApp(this.firebaseConfig);
                this.auth = firebase.auth(this.app);
                this.firestore = firebase.firestore(this.app);
            }
            return this;
        } catch (error) {
            console.error('Firebase初始化失败:', error);
            // 初始化失败时，保持app为null，后续操作会自动使用LocalStorage
            return this;
        }
    }
    
    getAuth() {
        return this.auth;
    }
    
    getFirestore() {
        return this.firestore;
    }
    
    async register(username, password) {
        if (!this.auth) {
            throw new Error('Firebase未初始化');
        }
        try {
            // 将用户名转换为邮箱格式
            const email = `${username}@fleet-op.com`;
            const userCredential = await this.auth.createUserWithEmailAndPassword(email, password);
            
            // 保存用户信息
            if (this.firestore) {
                await this.firestore.collection('users').doc(userCredential.user.uid).set({
                    username: username,
                    email: email,
                    createdAt: new Date().toISOString()
                });
            }
            
            return userCredential.user;
        } catch (error) {
            throw new Error(error.message);
        }
    }
    
    async login(username, password) {
        if (!this.auth) {
            throw new Error('Firebase未初始化');
        }
        try {
            // 将用户名转换为邮箱格式
            const email = `${username}@fleet-op.com`;
            const userCredential = await this.auth.signInWithEmailAndPassword(email, password);
            return userCredential.user;
        } catch (error) {
            throw new Error(error.message);
        }
    }
    
    async logout() {
        if (!this.auth) {
            throw new Error('Firebase未初始化');
        }
        return this.auth.signOut();
    }
    
    getCurrentUser() {
        if (!this.auth) {
            return null;
        }
        return this.auth.currentUser;
    }
    
    onAuthStateChanged(callback) {
        if (!this.auth) {
            // 如果Firebase未初始化，立即调用回调传入null
            callback(null);
            return () => {}; // 返回空函数作为unsubscribe
        }
        return this.auth.onAuthStateChanged(callback);
    }
    
    async saveOperation(operation) {
        if (!this.firestore) {
            throw new Error('Firebase未初始化');
        }
        try {
            const user = this.getCurrentUser();
            if (!user) {
                throw new Error('用户未登录');
            }
            
            const docRef = await this.firestore.collection('users').doc(user.uid)
                .collection('operations').add(operation);
            
            return docRef.id;
        } catch (error) {
            throw new Error(error.message);
        }
    }
    
    async getOperations() {
        if (!this.firestore) {
            throw new Error('Firebase未初始化');
        }
        try {
            const user = this.getCurrentUser();
            if (!user) {
                throw new Error('用户未登录');
            }
            
            const querySnapshot = await this.firestore.collection('users').doc(user.uid)
                .collection('operations').orderBy('timestamp', 'desc').get();
            
            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            throw new Error(error.message);
        }
    }
    
    async deleteOperation(operationId) {
        if (!this.firestore) {
            throw new Error('Firebase未初始化');
        }
        try {
            const user = this.getCurrentUser();
            if (!user) {
                throw new Error('用户未登录');
            }
            
            await this.firestore.collection('users').doc(user.uid)
                .collection('operations').doc(operationId).delete();
        } catch (error) {
            throw new Error(error.message);
        }
    }
}
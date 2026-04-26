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
        if (!this.app) {
            this.app = firebase.initializeApp(this.firebaseConfig);
            this.auth = firebase.auth(this.app);
            this.firestore = firebase.firestore(this.app);
        }
        return this;
    }
    
    getAuth() {
        return this.auth;
    }
    
    getFirestore() {
        return this.firestore;
    }
    
    async register(email, password) {
        try {
            const userCredential = await this.auth.createUserWithEmailAndPassword(email, password);
            return userCredential.user;
        } catch (error) {
            throw new Error(error.message);
        }
    }
    
    async login(email, password) {
        try {
            const userCredential = await this.auth.signInWithEmailAndPassword(email, password);
            return userCredential.user;
        } catch (error) {
            throw new Error(error.message);
        }
    }
    
    logout() {
        return this.auth.signOut();
    }
    
    getCurrentUser() {
        return this.auth.currentUser;
    }
    
    onAuthStateChanged(callback) {
        return this.auth.onAuthStateChanged(callback);
    }
    
    async saveOperation(operation) {
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
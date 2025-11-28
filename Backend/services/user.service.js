const User = require('../models/user.models');

const loginOrSignup = async (airtableProfile, tokens) => {
    const {id, email, name, avatarUrl} = airtableProfile;
    const {accessToken, refreshToken} = tokens;

    try{
        const filter = { airtableId: id };

        const update = {
            airtableId: id,
            profile: { name, email, avatarUrl},
            accessToken: accessToken,
            refreshToken: refreshToken,
            lastLogin: new Date()
        };

        const user = await User.findOneAndUpdate(filter, update, {
            new: true,
            upsert: true
        });
        return user;
    }catch(err){
        console.error('Error in loginOrSignup:', err);
        throw new Error('Failed to login or signup user');
    }
};

const getUserById = async (id) => {
    return await User.findById(id);
};

module.exports = {
    loginOrSignup,
    getUserById
};
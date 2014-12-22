

/**
*  get profile of the specified user
*  @parameter id : user id whose profile being loaded
*  @parameter type : profile type, one of the "FULL","BASIC", "INTRODUCTION", "SIGNATURE"
*  @return profile of the specified user
**/
function loadProfile (id, type, callback) {

}

exports.getProfile = function (req, res) {
	res.json({ message: '/profile' });
}
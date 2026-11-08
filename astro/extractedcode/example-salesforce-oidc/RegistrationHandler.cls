global class FusionAuthRegHandler implements Auth.RegistrationHandler {
    // This is the profile name that you want to create users
    static final string STANDARD_PROFILE = 'Standard User';

    // This will be appended to the username and it must be unique across all Salesforce organizations
    static final string ORG_SUFFIX = '.your.fusionauth.application.url';

    global User createUser(Id portalId, Auth.UserData data) {
        User u = buildUser(
                new User(),
                data
        );
        return u;
    }

    global void updateUser(Id userId, Id portalId, Auth.UserData data) {
        User u = buildUser(
                new User(id = userId),
                data
        );
        update (u);
    }

    private User buildUser(User u, Auth.UserData data) {
        Profile p = [SELECT Id FROM profile WHERE name = :STANDARD_PROFILE];
        u.profileId = p.Id;
        u.username = data.email + ORG_SUFFIX;
        u.email = data.email;
        if (data.firstName != null && data.firstName != '') {
            u.firstName = data.firstName;
        } else {
            String givenName = data.attributeMap.get('given_name');
            if (givenName != null && givenName != '') {
                u.firstName = givenName;
            }
        }
        if (data.lastName != null && data.lastName != '') {
            u.lastName = data.lastName;
        } else {
            String familyName = data.attributeMap.get('family_name');
            if (familyName != null && familyName != '') {
                u.lastName = familyName;
            }
        }
        String alias;
        if (data.userName != null && data.userName != '') {
            alias = data.userName;
        } else {
            alias = data.email;
        }
        if (alias.length() > 8) {
            alias = alias.substring(0, 8);
        }
        u.alias = alias;
        u.languagelocalekey = UserInfo.getLocale();
        u.localesidkey = UserInfo.getLocale();
        u.emailEncodingKey = 'UTF-8';
        u.timeZoneSidKey = data.attributeMap.get('timezone');
        if (u.timeZoneSidKey == null || u.timeZoneSidKey == '') {
            // @TODO change this to the default timezone for users
            u.timeZoneSidKey = 'GMT';
        }
        return u;
    }
}

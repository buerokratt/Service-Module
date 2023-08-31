import { api } from './mock-apis';
import * as API_CONF from './api-conf';

let stateSwitch = true;

const mockPath = "/mock";

let currentState = {
    idCode: "EE30303039914",
    active: stateSwitch ? 'true' : 'false',
    status: stateSwitch ? 'online' : 'offline'
}
export const customJwt =
    api
        .onGet(mockPath + import.meta.env.REACT_APP_AUTH_PATH)
        .reply(200, {
            data: {
                custom_jwt_userinfo: {
                    firstName: "Rasmus",
                    lastName: "Eimla",
                    idCode: "EE30303039914",
                    displayName: "Rasmuss",
                    JWTCreated: '1691471980000',
                    login: "EE30303039914",
                    csaEmail: "rasmus@gmail.com",
                    authorities: [
                        "ROLE_ADMINISTRATOR"
                    ],
                    csaTitle: "Super User",
                    JWTExpirationTimestamp: '1691475580000'
                }
            },
            error: null
        });

export const getUserRole =
    api
        .onGet(mockPath + '/cs-get-user-role')
        .reply(200, {
            data: {
                get_user: [
                    {
                        "authorities":
                            ["ROLE_ADMINISTRATOR"]
                    }]
            },
            error: null
        })

export const getProfieSettings =
    api
        .onGet(mockPath + "/cs-get-user-profile-settings?userId=1")
        .reply(200, {
            response: null
        })

export const setProfileSettings =
    api
        .onPost('/')
        .reply(200, {})
export const getCustomerSupportActivity =
    api
        .onGet(mockPath + API_CONF.GET_CUSTOMER_SUPPORT_ACTIVITY)
        .reply(200, {
            data: {
                get_customer_support_activity: [
                    {
                        idCode: currentState.idCode,
                        active: currentState.active,
                        status: currentState.status
                    }
                ]
            },
            error: null
        })

export const setCustomerSupportActivity =
    api
        .onPost(mockPath + API_CONF.SET_CUSTOMER_SUPPORT_ACTIVITY, {
            idCode: currentState.idCode,
            active: currentState.active,
            status: currentState.status
        })
        .reply(200, {
            idCode: currentState.idCode,
            active: currentState.active,
            status: currentState.status
        })

import { api } from './mock-apis';
import * as API_CONF from './api-conf';

let stateSwitch = true;

const mockPath = "/mock";

let currentState = {
    idCode: "EE30303039914",
    active: stateSwitch ? 'true' : 'false',
    status: stateSwitch ? 'online' : 'offline'
}

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

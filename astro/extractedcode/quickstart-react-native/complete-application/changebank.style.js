import {StyleSheet} from 'react-native';

export default StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    h1: {
        color: '#096324',
        fontSize: 30,
        fontWeight: '600',
    },
    h3: {
        color: '#096324',
        marginTop: 20,
        marginBottom: 40,
        fontSize: 24,
        fontWeight: '600',
    },
    a: {
        color: '#096324',
    },
    p: {
        fontSize: 18,
    },
    headerEmail: {
        color: '#096324',
    },
    finePrint: {
        fontSize: 16,
    },
    body: {
        fontFamily: 'sans-serif',
        padding: 0,
        margin: 0,
    },
    hRow: {
        display: 'flex',
        alignItems: 'flex-end',
        flex: 1,
        rowGap: 10,
    },
    pageHeader: {
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
    },
    logoHeader: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: 150,
        paddingVertical: 10,
        marginHorizontal: 20,
    },
    menuBar: {
        display: 'flex',
        flexDirection: 'row',
        columnGap: 10,
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 20,
        backgroundColor: '#096324',
    },
    menuLink: {
        fontWeight: '600',
        color: '#ffffff',
    },
    buttonLg: {
        backgroundColor: '#096324',
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '700',
        borderRadius: 10,
        textAlign: 'center',
        paddingHorizontal: 15,
        paddingVertical: 5,
        textDecorationLine: 'none',
        overflow: 'hidden',
    },
    contentContainer: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        paddingTop: 60,
        paddingRight: 20,
        paddingBottom: 20,
        paddingLeft: 40,
    },
    balance: {
        fontSize: 50,
        fontWeight: '800',
    },
    changeLabel: {
        flex: 1,
        fontSize: 20,
        marginRight: 5,
    },
    changeInput: {
        flex: 1,
        flexGrow: 1,
        flexShrink: 0,
        fontSize: 20,
        borderColor: '#999',
        borderWidth: 1,
        padding: 5,
        textAlign: 'right',
    },
    changeMessage: {
        fontSize: 20,
        marginBottom: 15,
    },
    appContainer: {
        width: '100%',
        marginTop: 40,
        paddingHorizontal: 20,
    },
    changeContainer: {
        flex: 1,
    },
    image: {
        flex: 1,
        height: '100%',
    },
    inputContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: "space-between",
        marginVertical: 10,
    },
});

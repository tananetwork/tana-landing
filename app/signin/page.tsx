import Logo from '@/components/core/Logo'
import SignIn from '@/components/core/SignIn'
import Links from '@/components/core/Links'

export default function SignInPage () {


    return (
        <>
            <Logo />
            <SignIn />
            <Links target='signup' />            
        </>
    )
}
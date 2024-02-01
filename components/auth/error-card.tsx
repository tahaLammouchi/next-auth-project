import { CardWrapper } from "./card-wrapper"
import { ExclamationTriangleIcon } from "@radix-ui/react-icons"


const ErrorCard = () => {
  return (
    <CardWrapper
      headerLabel="Oops! Something went wrong!"
      backButtonHref="/auth/login"
      backButtonLabel="Back to Login"
    >
    <div className="w-full flex justify-center items-center">
        <ExclamationTriangleIcon className="text-destructive h-10 w-10" />
    </div>
    </CardWrapper>
  )
}

export default ErrorCard
import './Welcome.css'

const TEXT = 'Tell your story'

const Welcome = () => {
    return (<div className="welcome">
        <div className="welcome_text">{TEXT}</div>
        <div className="welcome_sub sub_one">{TEXT}</div>
        <div className="welcome_sub sub_two">{TEXT}</div>
        <div className="welcome_sub sub_three">{TEXT}</div>
        <div className="welcome_sub sub_four">{TEXT}</div>
        <div className="welcome_sub sub_five">{TEXT}</div>
    </div>)
}

export default Welcome
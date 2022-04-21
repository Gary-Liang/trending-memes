import PropTypes from 'prop-types'

export default function Title(props) {
        return (
                <header>
                        <h1 style={headingStyle}>{props.name}</h1>
                </header>
        );

}

Title.defaultProps = {
        name: 'Trending Memes',
}

Title.propTypes = {
        title: PropTypes.string,
}


const headingStyle = {
        margin: 'auto',
        padding: '40px'
}
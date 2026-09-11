import { Link } from "react-router-dom";

const Home = () => {
    return (<>
        <div className="hero">
            <img src="/hero.jfif" alt="Hero" />
        </div>
        <div className="greeting">
            <br />
            <h1>Welcome to TechSolve!</h1>
            <p>Welcome to our tech support hub, where technology meets reliable solutions. <br />Whether you're troubleshooting a device, resolving a software issue, or simply looking for guidance, <br />we're here to make technology easier to understand. <br />Explore our resources, discover helpful solutions, <br />and get the support you need to keep your digital world running smoothly.</p>
        </div>
        <br />
        <br />
        <div className="help-section">

            <h1>How can we help?</h1>

            <div className="help-cards">

                <div className="troubleshoot-card">
                    <img src="/troubleshoot.png" alt="Troubleshoot" />
                    <h2>Troubleshoot</h2>
                </div>

                <div className="tech-card">
                    <img src="/tech.png" alt="Tech Help" />
                    <h2>Tech Help</h2>
                </div>

                <div className="guide-card">
                    <img src="/Guide.png" alt="Guide" />
                    <h2>Guide</h2>
                </div>

            </div>

        </div>

        <h1 className="ChooseUs">Why Choose Us?</h1>
        <div className="WhyUs">
            <h3 className="WhyUs-Card1">✓ Easy to understand</h3>
            <h3 className="WhyUs-Card2">✓ Reliable solutions</h3>
            <h3 className="WhyUs-Card3">✓ Support when you need it</h3>
            <h3 className="WhyUs-Card4">✓ Step-by-step guides</h3>
        </div>

    </>)
}

export default Home;
import "./WhyChoose.css";

export default function FeatureCard({ feature }) {

  return (

    <div className="featureCard">

      <div
        className="featureIcon"
        style={{
          background: feature.color
        }}
      >
        {feature.icon}
      </div>

      <h3>{feature.title}</h3>

      <p>{feature.description}</p>

    </div>

  );

}
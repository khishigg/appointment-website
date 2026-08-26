import Hero from "../components/Hero";
import PartnerLogos from "../components/PartnerLogos";
import RecommendedClinics from '../components/RecommendedClinics';
import usePublicClinics from '../hooks/usePublicClinics';


export default function Home() {
  const clinicData = usePublicClinics();

  return (
    <>
      <Hero clinicData={clinicData} />
      <RecommendedClinics clinicData={clinicData} />
      <PartnerLogos />
    </>
  );
}

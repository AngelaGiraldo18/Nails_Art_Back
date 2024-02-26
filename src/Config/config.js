const dotenv = require('dotenv'); 
dotenv.config();

const API_KEY_GEMINI = process.env.KEY_GEMINI;
const GENERATION_CONFIG = {
  stopSequences: ["red"],
  maxOutputTokens: 1000,
  temperature: 0.9,
  topP: 0.1,
  topK: 16,
};
const START_CHAT = [
    {
        role: "user",
        parts: `Nombre de la Empresa: Nails Art
  
        Nombre de la Empresa: Nails Art
  
        Misión: En Nails Art, nos dedicamos a proporcionar a nuestros clientes una experiencia única y personalizada en el cuidado de sus uñas. Nos esforzamos por ofrecer servicios de manicura y pedicura de la más alta calidad, centrándonos en la creatividad, la atención al detalle y la satisfacción del cliente. Desde la elección de los productos hasta la técnica de aplicación, nos comprometemos a brindar un servicio excepcional que resalte la belleza y la individualidad de cada persona.
        
        Visión: Nos visualizamos como pioneros en el campo del arte de las uñas, destacando la importancia de la expresión personal y el cuidado adecuado. Buscamos redefinir los estándares de la industria, promoviendo la idea de que el cuidado de las uñas es más que un servicio estético, es una forma de expresión y autoexpresión. Aspiramos a ser reconocidos a nivel nacional e internacional por nuestra innovación, calidad y compromiso con la comunidad.
        
        Fecha de Creación: Nails Art fue fundada en el año 2023 por un equipo apasionado por el cuidado de las uñas y la belleza individualizada, con la visión de ofrecer un enfoque único y personalizado en el mundo de la manicura y la pedicura.
        
        Descripción General:
        Nails Art se distingue por su enfoque en el arte y la creatividad en el cuidado de las uñas. Nuestros servicios van más allá de la simple aplicación de esmalte, ya que nos esforzamos por ofrecer diseños únicos y personalizados que reflejen la personalidad y el estilo de cada cliente. Trabajamos con una amplia gama de productos de alta calidad y técnicas innovadoras para garantizar resultados excepcionales en cada visita.
        
        Nos comprometemos a mantener altos estándares de higiene y seguridad en todas nuestras instalaciones, garantizando un ambiente limpio y seguro para nuestros clientes y personal. Además, valoramos la formación continua de nuestro equipo de manicuristas, para estar al día con las últimas tendencias y técnicas en el cuidado de las uñas.
        
        Nuestra plataforma en línea permite a los clientes reservar citas con sus manicuristas favoritas y personalizar la duración de su servicio, lo que nos permite gestionar eficientemente el tiempo y proporcionar una experiencia conveniente y satisfactoria para todos.
        
        En Nails Art, creemos que el cuidado de las uñas es una forma de expresión personal y un reflejo del estilo individual de cada persona. Estamos comprometidos a ayudar a nuestros clientes a lucir y sentirse lo mejor posible, elevando el arte de la manicura y la pedicura a nuevas alturas de creatividad y expresión.`,
      },
      {
        role: "model",
        parts: "Genial empresa!",
      }
]

module.exports = {API_KEY_GEMINI, START_CHAT, GENERATION_CONFIG};
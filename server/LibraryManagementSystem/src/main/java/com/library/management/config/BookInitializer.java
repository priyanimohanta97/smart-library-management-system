package com.library.management.config;

import com.library.management.entity.Book;
import com.library.management.repository.BookRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Component
public class BookInitializer implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(BookInitializer.class);

    private final BookRepository bookRepository;

    public BookInitializer(BookRepository bookRepository) {
        this.bookRepository = bookRepository;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        List<Book> seedBooks = List.of(
            createBook(
                "book-1",
                "Gödel, Escher, Bach: An Eternal Golden Braid",
                "A metaphorical fugue on minds and machines in the spirit of Lewis Carroll",
                "Douglas R. Hofstadter",
                "Professor of Cognitive Science, Indiana University",
                1979,
                "ai-computing",
                "AI & Computing",
                "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=800",
                "A towering interdisciplinary masterpiece tracing recursive intelligence from Bach fugues to formal logic.",
                4.8,
                1420,
                777,
                "QA76.6 .H63 1979",
                "Main Stacks · 4th Floor, Alcove B",
                3,
                4,
                "Douglas Hofstadter's Pulitzer Prize–winning book explores the deep connections between the music of J.S. Bach, the graphic art of M.C. Escher, and the mathematical logic of Kurt Gödel. Hofstadter reveals how self-reference and formal systems give rise to human consciousness and machine intellect.",
                "Cognitive Science, Metamathematics, Recursion, AI Ethics"
            ),
            createBook(
                "book-2",
                "The Design of Everyday Things",
                "Revised and Expanded Edition",
                "Don Norman",
                "Director, The Design Lab at UC San Diego",
                2013,
                "ai-computing",
                "AI & Computing",
                "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=800",
                "The foundational treatise on usability, mental models, and the quiet psychology behind every physical and digital artifact.",
                4.6,
                3890,
                368,
                "TS171.4 .N67 2013",
                "Design & Human Sciences · 2nd Floor",
                5,
                6,
                "Even the smartest among us can feel inept trying to open a door or operate a thermostat. Norman explains that poor, unintuitive design—not user incompetence—is to blame, presenting an essential guide to cognitive engineering.",
                "Human Factors, Cognitive Ergonomics, UX Architecture"
            ),
            createBook(
                "book-3",
                "Meditations",
                "A New Translation with Introduction & Notes by Gregory Hays",
                "Marcus Aurelius",
                "Emperor of Rome (161–180 AD)",
                2002,
                "philosophy",
                "Philosophy & Ethics",
                "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&q=80&w=800",
                "Private spiritual exercises written on campaign, timeless in their clarity on agency, resilience, and mortal duty.",
                4.7,
                5210,
                256,
                "B580 .H39 2002",
                "Special Collections · Room 102",
                2,
                3,
                "Written without thought of publication, Emperor Marcus Aurelius recorded private notes to himself on Stoic philosophy, coping with grief, accepting mortality, and remaining steadfast amid turmoil.",
                "Stoicism, Classical Antiquity, Ethics, Self-Governance"
            ),
            createBook(
                "book-4",
                "The Master and Margarita",
                "Modern Library Edition (Burgin & O'Connor Translation)",
                "Mikhail Bulgakov",
                "Novelist and Playwright (1891–1940)",
                1967,
                "classical-lit",
                "Literary Classics",
                "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=800",
                "A subversive, satirical riot through 1930s Moscow featuring the Devil, a talking cat, and a love that defies totalitarian censorship.",
                4.9,
                2840,
                412,
                "PG3476.B78 M3 1995",
                "Comparative Literature · 3rd Floor, Bay 7",
                0,
                2,
                "Written in secret during the height of Stalin's purges and published posthumously, Bulgakov's masterpiece weaves two narratives: the visit of the devil Satan disguised as Professor Woland to Moscow, and the historical trial of Pontius Pilate.",
                "Magic Realism, Satire, Soviet Literature, Manuscripts"
            ),
            createBook(
                "book-5",
                "Structure and Interpretation of Computer Programs",
                "Second Edition with JavaScript Adaptation",
                "Harold Abelson & Gerald Jay Sussman",
                "Professors of Electrical Engineering and Computer Science, MIT",
                1996,
                "ai-computing",
                "AI & Computing",
                "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=800",
                "The quintessential text on computational abstraction, meta-circular evaluators, and the architecture of algorithmic thinking.",
                4.9,
                1980,
                657,
                "QA76.6 .A255 1996",
                "Main Stacks · 4th Floor, Alcove D",
                4,
                4,
                "Widely known as the \"Wizard Book\", SICP uses programming as a medium for expressing computational concepts, demonstrating how complex systems are built from modular functional building blocks.",
                "Scheme, Compilers, Functional Programming, MIT"
            ),
            createBook(
                "book-6",
                "The Order of Time",
                "An lyrical exploration into quantum gravity and the nature of temporal flow",
                "Carlo Rovelli",
                "Theoretical Physicist, Aix-Marseille University",
                2018,
                "science-nature",
                "Natural History & Physics",
                "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=800",
                "A mesmerizing unraveling of our intuitive illusions regarding the passage of seconds, entropy, and cosmic memory.",
                4.5,
                3100,
                240,
                "QC173.59.S65 R68 2018",
                "Physical Sciences Annex · 1st Floor",
                2,
                3,
                "Why do we remember the past and not the future? Does time flow, or is it an artifact of our perspective? World-renowned physicist Carlo Rovelli combines poetic elegance with modern physics to question the bedrock of our experience.",
                "Quantum Gravity, Thermodynamics, Cosmology, Philosophy of Time"
            ),
            createBook(
                "book-7",
                "Seeing Like a State",
                "How Certain Schemes to Improve the Human Condition Have Failed",
                "James C. Scott",
                "Sterling Professor of Political Science & Anthropology, Yale",
                1998,
                "economics-society",
                "Political Economy & Society",
                "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=800",
                "Indispensable study on high modernism, state legibility, and why grand centralized plans so routinely collapse against local practical knowledge (metis).",
                4.7,
                1650,
                445,
                "JC330 .S385 1998",
                "Social Sciences Stacks · 3rd Floor",
                1,
                2,
                "Scott analyzes tragic failures of well-intentioned large-scale state planning—from Le Corbusier's sterile cities to compulsory collectivization—uncovering the hubris of ignoring indigenous practical knowledge.",
                "Political Theory, High Modernism, Urban Planning, Metis"
            ),
            createBook(
                "book-8",
                "The Machinic Unconscious",
                "Essays in Schizoanalysis and Semiotic Cartography",
                "Félix Guattari",
                "Psychoanalyst and Philosopher (Semiotext(e))",
                1979,
                "philosophy",
                "Philosophy & Ethics",
                "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=800",
                "A rigorous blueprint for understanding network assemblages, institutional desiring-machines, and semiotic rupture.",
                4.4,
                740,
                384,
                "BF175.5.U5 G82 1984",
                "Continental Philosophy Archives · Room 405",
                0,
                1,
                "Guattari elaborates a radical critique of Freudian psychoanalysis, advancing the concept of the unconscious not as a theater of repressed childhood memories, but as an open-ended production engine intersected by social machines.",
                "Continental Philosophy, Semiotics, Post-Structuralism"
            )
        );

        int seededCount = 0;
        for (Book book : seedBooks) {
            if (!bookRepository.existsByCode(book.getCode())) {
                bookRepository.save(book);
                seededCount++;
            }
        }

        if (seededCount > 0) {
            log.info("Initialized {} curated books into authoritative catalogue.", seededCount);
        } else {
            log.info("Authoritative book catalog already initialized. Preserving existing inventory records.");
        }
    }

    private Book createBook(
        String code,
        String title,
        String subtitle,
        String author,
        String authorRole,
        Integer publicationYear,
        String category,
        String categoryLabel,
        String coverImage,
        String curatorQuote,
        Double rating,
        Integer reviewsCount,
        Integer pages,
        String callNumber,
        String location,
        int copiesAvailable,
        int totalCopies,
        String synopsis,
        String tags
    ) {
        Book b = new Book();
        b.setCode(code);
        b.setTitle(title);
        b.setSubtitle(subtitle);
        b.setAuthor(author);
        b.setAuthorRole(authorRole);
        b.setPublicationYear(publicationYear);
        b.setCategory(category);
        b.setCategoryLabel(categoryLabel);
        b.setCoverImage(coverImage);
        b.setCuratorQuote(curatorQuote);
        b.setRating(rating);
        b.setReviewsCount(reviewsCount);
        b.setPages(pages);
        b.setCallNumber(callNumber);
        b.setLocation(location);
        b.setCopiesAvailable(copiesAvailable);
        b.setTotalCopies(totalCopies);
        b.setSynopsis(synopsis);
        b.setTags(tags);
        return b;
    }
}


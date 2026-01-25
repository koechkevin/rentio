import { getUrl } from '@/utils/getUrl';
import { Card, Col, Row } from 'react-bootstrap';

function ImageAndTextExample() {
  return (
    <Row>
      <Col>
        <Card>
          <Card.Img variant="top" src={getUrl('/images/others/placeholder.jpg')} />
          <Card.Body>
            <Card.Text>
              Some quick example text to build on the card title and make up the bulk of the card's content.
            </Card.Text>
          </Card.Body>
        </Card>
      </Col>
      <Col>
        <Card>
          <Card.Body>
            <Card.Text>
              Some quick example text to build on the card title and make up the bulk of the card's content.
            </Card.Text>
          </Card.Body>
          <Card.Img variant="bottom" src={getUrl('/images/others/placeholder.jpg')} />
        </Card>
      </Col>
    </Row>
  );
}

export default ImageAndTextExample;

export const imageAndTextExampleCode = `import { getUrl } from "@/utils/getUrl";
import { Card, Col, Row } from "react-bootstrap";

function ImageAndTextExample() {
  return (
    <Row>
      <Col>
        <Card>
          <Card.Img variant="top" src={getUrl('/images/others/placeholder.jpg')} />
          <Card.Body>
            <Card.Text>
              Some quick example text to build on the card title and make up the
              bulk of the card's content.
            </Card.Text>
          </Card.Body>
        </Card>
      </Col>
      <Col>
        <Card>
          <Card.Body>
            <Card.Text>
              Some quick example text to build on the card title and make up the
              bulk of the card's content.
            </Card.Text>
          </Card.Body>
          <Card.Img variant="bottom" src={getUrl('/images/others/placeholder.jpg')} />
        </Card>
      </Col>
    </Row>
  );
}

export default ImageAndTextExample;`;

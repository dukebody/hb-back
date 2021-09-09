import { generateUniqueId } from '@loopback/context';
import { Client, expect } from '@loopback/testlab';
import { HelpbuttonsBackendApp } from '../..';
import { setupApplication } from '../helpers/test-helper';

describe('ButtonController (integration)', () => {
  let app: HelpbuttonsBackendApp;
  let client: Client;

  before('setupApplication', async () => {
    ({ app, client } = await setupApplication());
  });
  after(async () => {
    await app.stop();
  });

  it('/buttons/new bra', async () => {
    const res = await client.post('/buttons/new').query({ networkId: 4 }).send({
      "name": "button name",
      "type": "exchange",
      "tags": [
        "onetag"
      ],
      "description": "description of da button",
      "latitude": 3.12321321,
      "longitude": 5.32421321,
    }).expect(200);
    expect(res.body).to.containEql({
      id: 6,
      name: 'button name',
      type: 'exchange',
      tags: ['onetag'],
      description: 'description of da button',
      latitude: 3.12321321,
      longitude: 5.32421321
    });
  });

  describe('/buttons/find', () => {


    before('add networks', async () => {
      await client.post('/buttons/new').query({ networkId: 3 }).send({
        "name": "button name",
        "type": "exchange",
        "tags": [
          "onetag"
        ],
        "description": "description of da button",
        "latitude": 3.12321321,
        "longitude": 5.32421321
      }).expect(200);
    });
    it('/buttons/find with networks', async () => {
      const resFilterOne = await client.get('/buttons/find').query({ filter: '{"where": {"id":1}, "include":["networks"]}' }).expect(200);
      expect(resFilterOne.body[0].networks).to.deepEqual(
        [
          {
            name: 'Perritos en adopcion',
            id: 3,
            url: 'net/url',
            avatar: 'image/url.png',
            description: 'Net for animal rescue',
            privacy: 'publico',
            place: 'Livorno, Italia',
            latitude: 43.33,
            longitude: 43.33,
            radius: 240,
            tags: ['Animales', 'Perritos', 'Adopcion'],
            buttonsTemplate: [],
            role: 'admin'
          }
        ]);
    });

    it('/buttons/find without networks', async () => {
      const resFilterOne = await client.get('/buttons/find').query({ filter: '{"where": {"id":1}}' }).expect(200);

      expect(resFilterOne.body[0].networks).to.be.undefined();
    });

    it('/buttons/find get button with id=1', async () => {
      const resFilterOne = await client.get('/buttons/find').query({ filter: '{"where": {"id":1}}' }).expect(200);
      expect(resFilterOne.body[0].id).to.equal(1);
    });

  });

  it('/buttons/findById get button with id=1', async () => {
    const resFilterOne = await client.get('/buttons/findById/1').expect(200);
    expect(resFilterOne.body).to.deepEqual({
      id: 1,
      name: 'button name',
      type: 'exchange',
      tags: ['onetag'],
      description: 'description of da button',
      latitude: 3.12321321,
      longitude: 5.32421321
    });
  });


  it('/buttons/edit/1', async () => {
    const restFindByIdPrev = await client.get('/buttons/findById/1').expect(200);
    expect(restFindByIdPrev.body).to.deepEqual({
      id: 1,
      name: 'button name',
      type: 'exchange',
      tags: ['onetag'],
      description: 'description of da button',
      latitude: 3.12321321,
      longitude: 5.32421321
    });

    const newName = generateUniqueId();
    await client.patch('/buttons/edit/1').send({ "name": newName }).expect(204);

    const resFindByIdAfter = await client.get('/buttons/findById/1').expect(200);
    expect(resFindByIdAfter.body).to.deepEqual({
      id: 1,
      name: newName,
      type: 'exchange',
      tags: ['onetag'],
      description: 'description of da button',
      latitude: 3.12321321,
      longitude: 5.32421321
    });
    await client.patch('/buttons/edit/1').send({ "name": "button name" }).expect(204);
  });

  describe('/buttons/delete', () => {
    it('/buttons/delete/{id}', async () => {
      const restFindByIdPrev = await client.get('/buttons/findById/3').expect(200);
    expect(restFindByIdPrev.body).to.deepEqual({
      id: 3,
      name: 'button name',
      type: 'exchange',
      tags: ['onetag'],
      description: 'description of da button',
      latitude: 3.12321321,
      longitude: 5.32421321
    });

    await client.delete('/buttons/delete/3').expect(204);

    await client.get('/buttons/findById/3').expect(404);
    });
  });

  describe('/buttons/addToNetworks/{buttonId}', () => {
    it('/buttons/addToNetworks', async () => {
      const res = await client.get('/buttons/find').query({ filter: '{"where": {"id":4}, "include":["networks"]}' }).expect(200);
      expect(res.body[0].networks).to.be.undefined();

      await client.post('/buttons/addToNetworks').query({ networks: "[1,2,3]", buttonId: 4 }).expect(200);

      const res2 = await client.get('/buttons/find').query({ filter: '{"where": {"id":4}, "include":["networks"]}' }).expect(200);
      expect(res2.body[0].networks.length).to.equal(3);
    });
  });
});

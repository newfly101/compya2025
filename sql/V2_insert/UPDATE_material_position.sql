-- 자동 생성 파일 (scripts/gen_material_position_update.py).
-- 출처: 노말카드 포지션 조사_최종본_NOMAL_최종.xlsx
-- 레전드 재료 선수의 포지션을 채운다. 코치 행(player_name IS NULL)은 대상이 아니다.
--
-- 재료 PLAYER 행 444건 중 444건 매칭.

SET NAMES utf8mb4;
USE compyafun;
START TRANSACTION;

-- 1B 44건
UPDATE data_player_legend_material SET player_position_code = '1B'
WHERE id IN (
    '19aec6c7-f8ef-4470-8ede-daa1eaf54bbd', 'c2b5635f-0715-4a95-b1af-c9d19ac3d5e0', 'dd86e262-7e7d-4b73-9ea4-2814b0abb48f', '1e2f8e59-3c7c-4e00-b273-36d8542410c9',
    'bdc5b2ee-b845-4052-bed5-d0d7104f0683', '0c6b518c-5286-495a-a478-447c9a50a92b', '2ff02b4f-d420-4191-a1f4-b3068981c57b', 'e05fd98d-f119-40ea-ac6e-c9346d153de1',
    '315aeb31-173b-4369-85d9-e3bb6e802191', '673a2ba5-2d70-4fea-9d10-13ac59a5fffc', '4baa44ba-44eb-4b36-b3cf-91762d8ef85b', '9f2f1b79-1304-43a9-b88d-93a122a48ac7',
    '7e8a3ae9-7af6-4c9d-88f2-d5858fab68d4', 'a978c8b1-0d63-4b08-a8b2-f89ecf27c460', 'a8ac3021-9dac-4270-9610-154edb949775', '9cdd3ab5-8ea5-41b3-99ca-b4dadba6318d',
    '2443c5bc-6a9f-4a71-a5c2-20e35dfe579f', 'b93e7a9d-294b-4578-869e-7dbc89414930', '3ff709a8-a600-43a4-94c6-1b6cf0befed1', '411fb3a4-2bda-45de-94b9-512d67947ad3',
    'b1f13cd0-635a-4e34-93f3-18694f7c9c04', 'e8469df6-5d9a-4e7d-b785-5ebf40d17b7d', '7ba9fc64-8791-4efa-beb6-a8642d3c57ca', '4225998d-03a0-411a-8696-0c56c1e8a9e8',
    'f3eb390f-7c10-4c17-a388-c2397455cd00', '928e7caf-d647-458d-b2d4-d80f7cbb6a3f', 'ed9d9531-e644-40c1-a504-779e06d65d0f', '1d558c92-8b8b-4350-a9d6-3262377af629',
    '6ba184ee-1313-457f-9743-7e5b5364e3f3', '19778909-7a10-4630-8f38-08acc6f5eeba', 'f3a8a0cb-f1b6-4f7d-b8b1-5f4e15211bf7', 'f3f4c4cc-4918-41f7-8f04-6c9d33f26b8e',
    'c43a07ca-bbbc-43ab-9083-7d88091844ae', 'd1d93a8f-f151-4283-899e-913cfa303c36', '615b09e6-057a-4bfe-a000-8c8546095d42', '4b057fb7-21a5-4c82-8e35-63e27364da30',
    '8ae96301-ea37-46c9-849b-e4531de1f1f8', '7ca0a7e7-bdc4-42fc-9c86-f5db4cc2b13c', '2b942a61-2c81-4b1b-974c-fd4a0663a969', 'cdee635c-504b-4824-b62b-7261c883f5e7',
    '48b88686-4fa9-4c5d-9e16-236fd1457992', '5051309d-1d1d-4ddf-a0e9-d1f900a8a201', '07ebc015-ed6a-460a-a9b1-0c0c0f01a329', 'bc9ddf7a-b42c-4360-94af-65d326502fe3'
);

-- 2B 22건
UPDATE data_player_legend_material SET player_position_code = '2B'
WHERE id IN (
    '8c9e3b93-3165-445d-8dfc-c0c288f764a0', '730206b8-aa49-4737-8f23-bd6838ea4762', '17162b7a-1d76-476e-89bf-b25f4e864a5b', '8ff4e420-a328-436e-8ba1-b7b369cc6874',
    '9b298927-8d9b-4500-b085-c1fc7d70287e', 'f19f5e1a-4b97-467a-9eb6-dfc3e8dd3ff1', '2dc0e3f4-34a7-48b8-8037-ed09555901c6', '4a57bc5b-f24e-45f5-a8bb-62407f8fe091',
    'a32397c3-6117-4eeb-a371-28a65280ad54', '6fbfcbb1-48b2-4b15-a32e-a0bc2a6051f5', '49c959e1-4fca-4993-94d7-5462e26291a9', '3de89a41-412a-470f-a56a-df4a147987cf',
    'f1321fbf-27dc-4f5e-8650-5d13cd89d247', '7e2e70ad-2537-4e03-bc5a-b76ee705ff1a', 'b0337ad8-1584-4fcd-a690-9cc7ee80f387', '928b0670-d17a-46c8-bd38-72d935506e93',
    'cc667943-4133-41e2-bc26-3a0beb8c8e47', '2a7f45ad-c286-412d-869c-e55578ef52ac', '5a1380bc-0b82-43ea-a13b-6f02e469a85f', 'a00240c0-66ef-4201-8f42-b5c0452a33dd',
    '9cc9efdb-b20d-4997-9385-6ac79853c1dc', 'bafc9042-312e-4fff-9b0f-0b063da53465'
);

-- 3B 32건
UPDATE data_player_legend_material SET player_position_code = '3B'
WHERE id IN (
    'e5680b38-5016-457d-9ef9-e52ac1adcafe', '648d1d60-12c5-4aca-a234-c44cee1473dd', '764d5fdc-7fa6-4d7d-a1c0-ea13d563c368', '03aee735-5291-43dc-ab6e-5fd2bcb6ca19',
    'd177b639-6ca5-40d4-ab8e-71c1d17b3c09', '13969640-f2a6-4e31-b888-6e2d2af80068', '70006ff6-a50f-44df-8ccc-c1f9956822c3', '379d9361-63b1-459c-bdad-00b4a2a12b97',
    'b507e979-ed80-49bc-8b62-24829d41a5b3', '8951aba6-e326-400a-a5fa-d5daa138fa4b', '46831ddd-b0b9-4b5c-8470-8c66f0e0bdaa', 'c03f268b-074d-420e-ac9a-6b6ec21c90d0',
    '744dd328-a4f9-4d9d-bb41-86723455a105', '27968f59-1fff-4ff7-8d86-8796cae3f3ae', '66ddb2b6-64f2-49d1-8008-00e64f65f412', '893a1edb-1c80-4e72-a9fb-889f7f701d72',
    '7b6e35f3-f3ea-44d7-9e53-34acb1e3144a', '19dfcb5b-0e91-4c93-adc6-9fec01a1228c', '3d0faf85-25ef-432b-8793-27ecf4ff7736', '32062f40-8151-47ae-bec8-77ec790b85aa',
    'fd90b6c0-6e66-47d4-b6c0-59dd4827f368', 'e41bd7a0-3415-49fd-996e-0b85460ca8ff', '28f8a773-bfba-4ff7-8b01-837349cef0ec', '403bccfb-4903-41ea-9acc-3fe107554452',
    '12b5113d-d985-4ad7-85eb-645d1aadf316', '7eece245-e704-4453-b85e-f695594ed67a', '7f8d8e99-baa2-4540-8590-0fadd008c893', '962e9f4a-9133-4637-a20c-9b063f21b195',
    '0aa5861b-322a-4a5f-aa10-22dfe2922237', '98066e58-b18f-4fc9-aef6-2100a76e7799', '39498d4f-58f6-485a-82ad-e42843f3cc88', 'fdaa1aa4-7ecf-403e-9235-e5ffbdcb2a68'
);

-- C 38건
UPDATE data_player_legend_material SET player_position_code = 'C'
WHERE id IN (
    '9d5d1ab8-139a-4287-ac0d-1fc1a1bcc21d', '20d74d8f-ccf3-40d2-87c6-a5d8de820e5c', '4b3d490e-98d3-4daf-9bbb-37134348d6c5', 'ba8c7b82-60f4-4d98-80fc-82c76764fa98',
    '326668c1-027f-459c-b6c2-2825fc60273a', '17666cb6-e336-462a-b55a-59be863b4537', 'fde98bce-49fd-476e-bf48-3e24028c995f', 'a473266a-2f68-4f3f-84bb-46cb030ed4d7',
    '6159615e-0169-46ad-a1b3-5f089e026de8', '67cbc34a-e474-41c5-a47f-216b367cbaf7', 'f36e0bdf-07c3-486a-bc76-b548dc14f4ed', 'd8bd8a9b-97bf-461c-921a-ec0844848f85',
    '3ae3b90a-ab96-47c3-93a6-e49596126419', 'ad1efe22-8bb0-476f-b1dc-2ad0e34e86db', 'd9e9e714-08a1-456b-a3d6-74c6385b034e', '945e5f4b-30a1-4fca-9e04-5286eefef578',
    '88ea2737-ae41-4e52-a2fb-47f32630a1ec', '63f905e7-7162-4d96-b504-8246ff09b961', 'c1fb071d-88ae-4415-a1ec-aacefa8a7d08', 'eae89dc5-4353-41d9-a7eb-747041c6cd6e',
    '5ef5f73f-7c3b-4aa8-8349-5a591f0dd17e', 'd9eb5014-564c-42ff-918e-cefa505aeff4', '49bf95f7-f8f7-4733-8b5a-65995ffda687', '2d157fc3-1da9-4645-ba4d-ca2780588f24',
    '017435ef-6bc7-4f68-a797-ed93ca2e8e2f', '96d146b8-fe7a-4dd6-9316-4efb02fb3c87', 'b2b08049-dfc9-42f0-a6d0-c6a6f66c8618', 'f2c4bc4f-f04a-40b5-9a0e-719417052c52',
    '547ebbcb-70b4-42f2-88e9-011e109c632b', 'f8df6520-3fa8-42a8-958b-fa93a048f8fb', '289f152e-8b89-488e-9d0e-7d2695a18c9a', 'c72cd43d-b79f-4561-8aed-d21b006edce8',
    '6a428f69-c0ba-456a-bc56-171593fd1626', '788e6572-9cca-4224-9b17-642bb2663872', '2c81b32d-8041-4e01-b78e-664104f9e064', 'f4f4c006-a637-4067-a673-817e3572b863',
    '4071a322-f1d5-4d5e-835c-574012a67f83', 'ad428c64-4614-407b-ba6e-7611d028ccfa'
);

-- CF 23건
UPDATE data_player_legend_material SET player_position_code = 'CF'
WHERE id IN (
    'ffaf175d-9947-44b5-b650-224a8f09c38f', 'bb5547a9-1fa7-4ffa-a3f9-9b0ed0d60623', 'ebff5fc1-ee5f-4898-bc84-8ff5390a634d', '46910c6f-402b-4f07-9a18-5078893ecc51',
    'a4a1e48e-b81a-4cca-af3b-f0a335a57908', '797d9a33-5072-4b26-b35c-76e1ac5ebba7', '2f822416-87b6-482e-b17c-767219b09319', '0ec6a512-7288-4462-820e-f479e82f434f',
    'cbdc1310-b84e-44f7-8d07-5e42e571ce8f', '57da6373-1eab-4902-bfd2-16d4193b8353', '79fa1d1a-8332-4fef-96fe-a157f1125595', '6a10185d-cc9c-42ef-9b35-6add01211bfd',
    '51a784b9-ecef-49fd-8daa-225bd8dac9c4', '27bcf695-bfbf-4b32-b972-7f33e4826ac6', 'd4ab34a3-e311-417e-ae3e-60d82fcf71fd', 'b9808dea-7ac4-48fe-b786-7cccf14d0cc0',
    '8443d5ec-cdf0-4c95-84ff-4e9934199ccd', '7793ffce-c154-419f-a500-20dca2dea5f3', '32496fad-7a32-4673-8644-066bff1b6799', '2b4d45f9-da8c-4d85-90b2-093e37038fce',
    'd55e1783-6ad7-48c2-96a3-6fef1bde63f8', '73279597-b0f3-4a49-afd1-1373ac8ee224', 'b85c9bfd-2123-4431-b0a8-e695b20ae3d8'
);

-- CP 30건
UPDATE data_player_legend_material SET player_position_code = 'CP'
WHERE id IN (
    'ca11494d-3e67-4b9d-a447-490292047814', '1e3fdf45-e878-4c23-a3b5-77dadb16bf7c', '096ae49f-35e4-44d2-8bde-860fd9298258', '35a8af4d-5e8a-41d5-94ec-76f3146ec662',
    '75da43e0-7a1a-4fbf-a0dc-d503d68f2545', '4fb490af-4b72-43a5-aa4e-b2f528a41884', '73563984-20fb-49f6-8646-9ac48a2eace7', 'f9156195-47f9-4585-bfbe-9ea92a3bcc83',
    '5c1645ff-7149-4047-97b9-b773e6c8af90', 'd3d435b8-9646-4d83-b019-02b469fb5de0', '4a0fecb3-81d9-475a-8db4-3e52ab3932b1', 'dc8c52ad-dcef-4291-a166-2e2b270dddd1',
    'd4157dfc-fa52-4ccf-8c5d-63b776c5c5c4', '3006c47b-ad1b-4cf5-8d20-f735b3f01eb6', 'ac66fa2d-c024-493b-994d-230bc77c5dc4', '6a433465-caca-4411-97c0-ad928585bdb3',
    'fb6a557e-98f8-4bdc-a1e8-ee30688caa2a', '21f17e7d-10e4-4448-b957-1a6cd5678bed', '33da005e-e1f2-401a-aeb7-c7f831a419d9', '125be6d6-15e4-43cc-9718-f0670175e078',
    'd2b1677c-b776-485d-bbd7-c6b40d728053', 'dbf3a617-e0c5-4dae-96f8-06a43789ce9f', '4b4c1fb4-f11c-4e14-b2a6-5b16aae93744', '17fb6593-57be-406d-92ce-ca0801b0b3eb',
    'b403faf3-61ab-4b79-a127-4d1ee03b47f6', 'aa6eeabc-ad64-46cb-8ebb-aa68ce7ad43f', 'e9b6103e-2049-4c68-9994-61e44e60514e', '97448c73-2936-41ac-bbd7-1e5eb3169248',
    '24535ad3-8ed3-490b-9c1a-1bc0390858eb', '995db11f-e4b5-4ac2-a65d-eed9269de2b2'
);

-- DH 29건
UPDATE data_player_legend_material SET player_position_code = 'DH'
WHERE id IN (
    'c9bb388b-7142-4ca2-aa1c-0bf34cb00f2a', '643844bb-dc05-4649-9ad7-6ecd57503273', 'd05c3f55-8960-4bfd-b721-4cc2f27fb6b6', 'f8f382d3-b340-4414-a4e7-ac5ae0aa45f1',
    'cfb4ef99-2d80-4007-9896-1ef3240e2378', '17ea7757-e302-4d49-a931-5d544635327b', '1e88c423-5f2d-4d86-a621-590164e43d52', 'bfb2c827-3b56-4a26-88fc-5f40f6c6dc97',
    'c24fc7fb-811c-4e19-9d1f-19bf422c3438', 'bf4ba368-a330-42ad-8bb3-2cbc889e2424', 'c0cdd2c8-9f89-4251-8532-699e5ee08eaa', '7caaafa1-84e5-4154-b44a-632fb303f110',
    '7a515f7b-698c-4afc-bf05-e1bb324f2a08', '2cbf9725-e186-4efd-bb60-2022bbac0046', '2470a8ac-e620-424b-909f-d827b7fb2a9b', 'c21e4b24-1be3-44e6-8555-56e8e68be434',
    '30635e61-08af-48eb-9984-008a54ad6721', '21a08649-487b-4f18-a58b-eae843e1d557', '74fcea27-323b-4a46-a333-dac712000efb', 'b3543d58-4972-483d-bd96-0af26ef94a21',
    '3799e306-3ca3-4b95-bfc3-e6df56eb9cf2', '89bd90a0-e19e-4ab9-901a-e4b0e71a3854', 'b325bf8e-1f6c-4c9d-a97b-8752247c7dae', '0d6486ed-1b9f-4d5c-932e-9796fff2ba14',
    '2e6d9200-d419-4128-ab02-49620313a5fd', 'a4792d84-6199-4468-ae29-460b4becd903', '522499ec-9a54-48a3-8d65-cd695e2e1d9d', '26dfe626-bd70-4cad-9c53-8b98dd305261',
    '912215f6-6bb6-422b-b68b-bf776e833aed'
);

-- LF 19건
UPDATE data_player_legend_material SET player_position_code = 'LF'
WHERE id IN (
    '9d25492f-45ef-44ef-a2b1-a38539954468', 'e8f6844b-a453-4179-96f8-00e0549fd253', 'ba22dc3e-0a20-477c-b39f-1f59a671aa7b', '7800e838-a92d-40db-a8c3-ed86a18b640b',
    '9927d7c8-abf7-4441-9ac5-56e43d7b8910', '487e2c0c-5e7e-4e93-9029-7d9a5604e90a', '6b1e99c4-b966-4465-a3ed-7ac977ea4d74', 'c9176154-5f44-4797-ac45-5580ff921747',
    'b3a38545-2371-4ad7-a837-cff908b1271a', 'a716e4a2-5ddd-4f15-87c4-6096d15b3305', '8b5fbb77-75fe-4955-9b58-e5694b82abac', 'e17e0a25-f942-4497-86d3-97f599e05eaa',
    '6260f8c7-2d7a-4390-bd69-24cf62d1612e', 'bd07d02e-cbb6-48f5-9e17-b8c52d3f4fb9', '4e872ec7-2af9-4c94-83e8-9c146104b2b2', 'b83141a0-15ee-4416-a514-9a166abf45b7',
    'a8d6bdc2-feec-47c0-b8a1-a8a076634465', 'dd86165c-0ee6-42e7-ac03-9dc37c8178b5', '4c1f45f1-ac5c-4ed8-91e3-4d51d345fcf0'
);

-- RF 27건
UPDATE data_player_legend_material SET player_position_code = 'RF'
WHERE id IN (
    '1fcfd11a-6b6d-43f8-a01c-bd7dcbfb42d3', 'fc28e749-e475-4aea-8fe8-c4198c7d7280', 'b4d07ef1-8464-4fa5-ae5f-8d2bebef8f33', '10e399bc-3794-4f80-96fa-8912318f7b96',
    'a0688f98-e3a0-43fc-a963-d88a31259344', 'd4a5eceb-56d3-4457-ba4f-7bab98e8835d', '09af78c5-b99a-4bee-8bdb-e768ee7bb041', 'b4919279-6807-4532-8a88-4aece1e62e9c',
    '27ab0e39-6783-4268-9cc6-e79eb4dba648', '11db4d35-440b-4bb7-85b7-84376d62077c', '59558d9f-acbb-4895-b9c7-448225e2a76a', '7c17854d-1a0f-486c-be75-f2218fe21821',
    '0cac5be3-a872-4ad0-b3fd-ba9166f95a30', '71398980-0122-4eda-b47d-3c324662adc7', '2e684631-d4a5-4bd0-a5ea-e54d3d62f1cb', '949172f4-388d-4642-94a8-09fee2118bb1',
    '87485267-2d8c-40bf-9c48-87126ecebdf5', '00752cdf-ba0f-418b-9948-abcc480528dc', '81ab07c9-637e-4a96-a3c2-1b194439845e', '6218e3ce-7bf3-4a1a-a75f-a7ea16d82a22',
    '48ccf320-0e3a-4a08-84a7-ec0c5c2b4a4b', 'f6175240-90b0-492b-887d-9f32488dc45b', '43792c65-dec4-4e73-9004-df20fa71771a', 'c86bfc84-8f1f-4385-9eab-30f8da64c67e',
    '8c023cc8-d4f7-40d3-9408-31ef230a5bad', '7e481eb2-c2c0-490f-8c66-20e952ad8f24', 'a63dd8b1-04cb-4379-9c07-6cf0deca10c5'
);

-- RP 37건
UPDATE data_player_legend_material SET player_position_code = 'RP'
WHERE id IN (
    'fae5d81b-e6b8-4ac3-9e29-5d38d2618c73', '9618befe-3ba8-495c-b55d-ccbc1ad44403', '8dcbab51-ea76-4ebe-b245-353b9524916d', 'd421de8d-9d2c-46c0-a095-39e8cc7d6503',
    'ccd74c4b-cedd-43e4-bf13-b501d095652e', '2ac21154-4449-470b-9ebf-82a0e39a6f6b', 'b0499031-00b6-4273-9d6e-14865d8420b6', '48a50b14-a024-4a99-88d6-9f9e13c3fd53',
    '6a183164-a0db-408c-affa-9aee538d8bae', '1c64e44a-0e81-40fc-8a32-626222cd6e90', '76d8d3fb-efe7-44b0-831e-ed08515e2665', 'ef28e4e0-0a3c-41ff-a63e-f3685e6f7c6f',
    '6f23b3b0-1433-4a28-bfb3-e563d2ef2b7a', '9b4058c8-930e-4846-945a-988fcee58e79', '505d7435-2956-4b62-b379-8986a6723cf1', 'e1681d06-c600-4c11-aa6a-298f05eaa23a',
    '8a8c07b3-1755-463a-9152-f896171069fe', '62e0c6bf-880d-4523-bd25-823be880d248', 'e5ad9686-8f13-42d1-b0ff-e523ef7f4ee8', 'd24bb026-c683-4374-8c97-760038887af0',
    '865f5d0b-1c2c-436c-a07c-9627d74ca255', 'e728211d-d558-46f1-a3b0-0def5c8f6e09', '6d71d3c2-afcc-44ec-8c07-5e5ae349e064', '03250362-8253-4d34-9067-2d3b3d9bd104',
    '1f8eb8dc-14f6-413a-8676-0cc330da44f2', 'dd775385-bb8f-4f9d-a6d6-0880686b681c', 'a2f85bb2-7f23-4c90-81b4-6f80ce0883b4', '7893d66a-78c7-4186-8acb-de2d0bd9e4eb',
    '08f142e8-ef3e-40b1-96da-1f0436fb168e', 'e312ab76-26b2-4cf3-b4b6-475a817ade92', '244bd153-ef8f-45f5-b3c2-56132b70dcc8', 'd43836e9-7cfe-457e-9d8a-0e021ba48bad',
    '4618a619-199b-4fee-bd5e-1c7d8761e0b2', '3e43d7f1-326d-4ed4-88e5-deae462327ff', 'a865c571-b3d8-4717-8362-7739fc177855', '4f3f6547-f474-4668-837d-5c15094c46bd',
    '7827091c-6a24-4eae-84cb-26bd05772a7f'
);

-- SP 110건
UPDATE data_player_legend_material SET player_position_code = 'SP'
WHERE id IN (
    '05746783-386f-4524-bab5-b1cc528eb8ff', '6ae8ad7d-8a20-4f2c-94c7-7a6035e29dd4', 'fcc00461-5028-4afc-967a-66d6e9cdcc61', '0b416820-ca67-4617-afad-7d652f07b1d5',
    'c8f1b822-8c6a-43be-ae08-83b660cee95d', '18f52304-3d2d-44cc-9ad0-115927555f44', 'c6c7a1d5-4088-45cc-a83a-df85f6af22a4', '0aab6eb9-a667-4a5c-97ca-dc3cfc6dd263',
    '3b56e08a-e9f9-4452-a9e0-db26348fa559', '04d273a3-054e-4180-932d-f3a0f3ce3055', '5b0f2fbe-7952-4228-bce5-a0a8cdd46253', 'a253669e-e86c-47f9-8e13-8ac76859704b',
    '3b11bb51-6996-4dbe-be20-6daae34a67df', 'd309a9c8-30ca-4351-983b-b4337ca8ef05', '19d03925-ee5c-4686-b4aa-6dc87dfb3d08', '9a9a08dc-0a73-42f4-9d63-70e309f86cad',
    'c60eb40b-e84d-4f74-bb53-6cda15dbdbda', '2282eedb-75fc-42d5-a50d-01dee872086f', '6baf0218-6fa9-4a91-9ab3-69e78b44b5f5', '73439edb-8eff-4c88-a1e7-5a1bbdf9e078',
    'd2c50791-6ab3-483e-9db1-4cb27c3884c4', '538c390d-624f-407c-b000-28e57841765c', 'f1f69322-1671-4776-aebb-2ee2baf1b07d', '3e3e6221-2fe1-490d-bf26-87ce728b8a85',
    'ba1fdbe1-2cc8-4771-b9d8-7be828cb08ef', '0cbc64cf-f63d-4d39-acac-ea0f2401926c', '277855a3-fe6f-4354-ac42-6a0baf977682', '474e4fc2-ff03-49fe-ae0d-58f02d16ed85',
    '74ae12d9-0fb0-427f-8b5f-ea74d1e4055b', '293af929-7b91-4f6a-9024-e5d91dacde13', '8a0f33cd-57a1-4083-8c6c-49f2b4b961ca', 'fd55b1c0-b3aa-495e-a08b-ebb7f4599370',
    'fd2b3003-4ff2-4ed0-9572-b4ed378c7d40', 'd3c42ae3-4d8d-4788-ba23-a255b55d42a6', '7600fabe-d688-4239-8acd-fc6516885cc9', 'b80b8545-271e-4b8f-8420-54b6c71cd261',
    'de81bf40-298e-4fba-8027-75e03f1c537a', 'ce617bdf-0a31-4777-9503-21062c4821f4', 'c0b5279d-dbb8-4c3c-b622-256c9b60dc78', 'bf2330c5-0ea9-4dde-a5cd-34e2ef86b363',
    'b7ac58e0-9145-4f32-8f57-49c6e11eb38f', '9d6ca786-489f-4f07-b7e5-aa505ad8cb03', 'defc74d1-a79e-47cd-88a0-034cf44609d7', '1ef6ab88-7873-4a45-b9d6-9bb94321a258',
    '7b0a0d13-b3b6-45f1-832f-5e81741d115a', 'bccaf287-0006-480e-8e3d-4a5ae84f2311', '2031a22d-ac7e-408e-b403-02ae2c4910d7', '6b38edc7-b9b5-4ca3-9b05-173b429dc544',
    '1319af33-fdbe-4f2d-a4d9-d1d6f2628f13', 'd5167431-4164-408f-b079-58d17350112d', 'c0fe8a79-c4e6-493d-84f8-f063d54f0a4a', 'dd2898eb-f36e-4ed1-8de5-0db0c9922151',
    '3b0a5cc7-b39b-4a5d-b5f3-459cdc5b579e', '46d81460-5cf4-4519-8b17-2312250151f6', '84ad515e-059c-4dae-8a85-64120ab1dafc', '485eb669-fb89-4508-aa3c-e090220cbb40',
    '2fa8b7a9-03d6-4b39-8d6b-c1c491920d97', '089ed048-f120-44dd-af08-5af7891c5858', '9827e6a8-cab5-40fa-86e1-d1a0a8bee45e', '94ef2c15-7dc3-45a1-be51-adcf3d501a8d',
    '701e9e3b-2d31-470e-adc2-d5e3d8062aa3', '230d05e5-5190-475d-97a4-b06335c87c76', '2b9c7382-4aa9-4881-ad32-7378793622bf', '5e5a91fb-24a4-4a6c-9e00-f88918a47787',
    '828fb442-3b93-4947-9ace-ad286cbe238e', '9bcfdd53-efbe-41bd-b0d0-d4b4c60564b7', 'bee277eb-fa9d-4a5a-9920-65008bfa30df', '1bbcbcd3-3368-4de4-974e-7d485468d501',
    'f453db43-7eb5-4a72-b15d-cdc93f8a5c57', '12e366d8-b186-4a7e-be30-48d6166f0a36', '1adfd91a-ab1d-4946-98ce-9ea5fcb0a94b', 'e79596fe-e605-458d-a1a6-4dc82cffd7dc',
    'f5a5ca33-7505-4197-8d94-9cb45a905dea', '388aed23-ea3a-4056-a7e4-d52af5686e58', '8b5b83e3-8add-4617-a080-bfcd45ed4c63', '9bab1b70-661f-4f70-9146-31e95de56dd5',
    'd99d5bc3-a121-40d0-8389-3316c5b651eb', 'be230f4b-14bc-4a03-bfe9-ceb079172b91', '16eb5d72-848c-4c0f-b914-9a0dd9b4680e', '5f09a03e-1185-4070-a780-8c20f046ed28',
    'db5cdff7-5804-4855-9b3a-1562ddfa355b', '08f17067-32fc-462d-9509-3a5864c06d5d', '65a6d2fa-ac00-4da3-b728-f9f1bf0c7d80', '440393aa-ebf3-48c3-bbde-3b282e00933b',
    '745abc04-4939-4e50-8f27-105656989c92', '11a47614-c1d2-4b88-a190-c4088227ad57', '1afa2abf-b2e9-406b-90fb-53cefa36ad34', '8f2a7cbc-ecf8-4e17-a5ac-effe6f4cb598',
    'fa1068f4-a556-4ec7-a10d-740caec08c27', '04184a8c-948f-401d-95aa-9dcd1a5881ad', '3cf6cd4e-8dac-4e3c-9770-4122f747cc35', '59e871c2-fc40-4b19-a219-76424981131f',
    'd88c2459-8ed8-4c64-b039-2ee929492ce1', 'c8e25a2e-e885-4600-bd3b-ad05e9032267', '98a7b252-1739-4ffc-851d-a8d59aab881a', '14e8dfbd-2110-4b8e-9875-7a712a173930',
    'c8884560-4863-40a3-a862-bbb219b3c03a', '9f21793b-79f2-4766-96be-e4a8efd827a8', '1e9e01b9-ff69-4c0d-8c98-6f9a352481ff', '2058e64f-a2e0-450a-a422-6ec3bb91f454',
    'a42b3798-f83f-416b-aeab-2c6414bcc4e6', 'a2e74bf8-bdda-4c87-bb1f-fc7be3fcdd91', 'd31f8fd9-cd52-4394-8ac2-e0a3463d6042', '0878565e-48e5-4b22-a58a-6098a2f78c0e',
    '56566222-3ac3-4dbc-ad14-d574cb85bc93', '4880cd0f-faca-4470-a115-f3de24050e9a', 'c04aea6a-5866-4fc3-83c2-306058cbe9d6', 'd381e122-726f-46d1-b401-d7bbd6b10fe9',
    '0a79637e-b74a-4084-b199-905de545289d', '2b76102c-e107-4109-99fd-6ea778acd9b5'
);

-- SS 33건
UPDATE data_player_legend_material SET player_position_code = 'SS'
WHERE id IN (
    '9d4b1c1c-e88c-4f43-9426-7e43993e3873', '737f8763-2347-4763-b3f4-d695b12b5a18', '48e603f5-b65d-44d6-beae-e8c02e2e9a0b', '04ec569f-44cc-430e-870e-35685ac5138e',
    '81ad7b41-43b4-43fe-9d53-ee4f1b4d7a62', '2c294df8-7a30-45b8-ad61-0c6a01a0fcff', '74f2714c-d96d-4427-a017-2c5eb116d018', '9bed7968-5ffb-431a-a819-1b3129d5b972',
    '1879d4a9-e78c-4709-84fb-5299d329bd00', 'd7bbb7af-fab6-45bb-b578-0eae8549575d', '2a8e71ac-9684-4e52-8ba6-2ce74f1a6420', '9caa3d65-820d-4f9c-9958-31b741d32351',
    '327e8c2e-d5d6-4bd6-be49-a0b043ac12d2', '15ccb070-48db-46de-a0da-fa9b9e161d2d', 'b2137cac-a6ef-4236-bcd4-fc0fce693b35', '73470840-3698-41d4-bb3e-fb404e965439',
    '50b147ee-019f-4188-8f5a-cec04a7758e9', '3048fd0a-6fc2-426d-9b0e-e63a75ce87ab', '4e1af016-12ec-4fa2-982d-21d30a22a716', '63536a38-471b-472e-a826-8aa74f31e6fe',
    '41290d5a-1925-4134-800f-7934ffcb3100', '4f6a0600-e8f2-479a-b994-6f557e5d144b', 'b422548e-b280-4fe0-a727-c1724cfd1cd4', 'f6311722-9d7c-44bb-bd6d-30b59c1a9c31',
    '70f8cb5e-7a62-47a9-95df-9c4e73c10cd4', 'd9f3b8a9-73ac-420b-8e7d-b81ae0c61d16', '8341a470-5718-4b53-b677-bfff359b04cf', 'aa88c4be-d4fe-42b4-84de-1cb93eb50154',
    '119335b4-118e-40e4-a01c-6be21a27bd33', '83d1e5af-a409-4936-8ff3-b8a3e99c1a11', '1fb57dd2-4986-4046-b1b0-8d303c4a48d4', '853bdcf4-ae07-41c7-b539-5a08732293ef',
    '8bf3fe99-5eca-46cb-98b3-446548d1f28d'
);

COMMIT;

-- 확인용 --------------------------------------------------------
-- 포지션이 채워졌는지 (코치는 원래 NULL 이라 제외)
-- SELECT COUNT(*) AS 전체,
--        SUM(player_position_code IS NOT NULL) AS 채워짐,
--        SUM(player_position_code IS NULL)     AS 비어있음
-- FROM data_player_legend_material WHERE player_name IS NOT NULL;

-- 아직 비어있는 선수 목록
-- SELECT team_code, season_year, player_name FROM data_player_legend_material
-- WHERE player_name IS NOT NULL AND player_position_code IS NULL
-- ORDER BY team_code, season_year;